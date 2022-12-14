const express = require('express');
const axios = require('axios');
const moment = require('moment');

const getSecrets = require('../services/getSecrets');
const { sendEmail } = require('../services/email');

const axiosInstance = axios.create({
  baseURL: 'https://communitykitchens.my.salesforce.com/services',
});

const SF_API_PREFIX = '/data/v56.0';

const paypalRouter = express.Router();

// listener for paypal message
paypalRouter.post('/', async (req, res) => {
  // send paypal back a 200
  res.sendStatus(200);

  // return early if it's not a donation

  const paypalData = req.body;
  console.log(paypalData);
  if (paypalData.payment_gross < 0) {
    console.log('not a credit');
    return;
  }

  // post a verification to paypal - not working
  // verifyPaypalMessage(paypalData);

  const secrets = await getSecrets(['SF_CLIENT_ID', 'SF_CLIENT_SECRET']);
  const tokenResult = await getToken(secrets);
  if (!tokenResult.success) {
    return console.log(
      'Attempt to get Salesforce token failed: ' + JSON.stringify(tokenResult)
    );
  }

  // Check if contact exists
  let existingContact = await getContact(paypalData);
  if (!existingContact) {
    // contact needs to be added first so that opp can have a contactid
    existingContact = await addContact(paypalData);
    if (!existingContact) {
      return;
    }
  }

  if (paypalData.txn_type === 'recurring_payment_profile_created') {
    return addRecurring(paypalData, existingContact);
  }

  if (paypalData.txn_type === 'recurring_payment_skipped') {
    return updateRecurringOpp(paypalData, existingContact, 'Closed Lost');
  }

  const canceledSubscriptionStatuses = [
    'recurring_payment_suspended_due_to_max_failed_payment',
    'recurring_payment_profile_cancel',
    'recurring_payment_expired',
    'recurring_payment_suspended',
    'recurring_payment_failed',
  ];

  if (canceledSubscriptionStatuses.includes(paypalData.txn_type)) {
    return cancelRecurring(paypalData);
  }

  // catch all clause for unknown transaction type

  if (!paypalData.payment_date) {
    return console.log('Unknown type of message: no payment date');
  }

  // thank you email
  try {
    await sendEmail(paypalData);
  } catch (err) {
    console.log(err);
  }

  if (paypalData.amount_per_cycle) {
    // if donation is recurring, pledged opp will already exist in sf
    // update payment amount and stage
    const success = await updateRecurringOpp(
      paypalData,
      existingContact,
      'Posted'
    );
    if (success) {
      return;
    }
  }

  // insert opportunity
  addDonation(paypalData, existingContact);
});

const formatDate = (date) => {
  const splitDate = date.split(' ').filter((el, i, a) => i !== a.length - 1);
  return moment.utc(splitDate, 'HH:mm:ss MMM D, YYYY').format();
};

const verifyPaypalMessage = async (paypalData) => {
  const paypalUrl = 'https://ipnpb.paypal.com/cgi-bin/webscr';
  const verificationPost = new URLSearchParams();
  verificationPost.append('cmd', '_notify_validate');
  for (field in paypalData) {
    verificationPost.append(field, paypalData[field]);
  }

  try {
    const paypalResponse = await axiosInstance.post(
      paypalUrl,
      verificationPost,
      {
        headers: {
          'User-Agent': 'Node-IPN-VerificationScript',
        },
      }
    );

    // console.log(paypalResponse);
    if (paypalResponse.data !== 'VERIFIED') {
      console.log(paypalResponse);
      return { success: true };
    } else {
      console.log('succccess');
    }
  } catch (err) {
    console.log(err);
    return;
  }
};

const getToken = async (secrets) => {
  const SALESFORCE_AUTH_CREDENTIALS = {
    client_id: secrets.SF_CLIENT_ID,
    client_secret: secrets.SF_CLIENT_SECRET,
    grant_type: 'client_credentials',
  };

  const SFAuthPost = new URLSearchParams();
  for (field in SALESFORCE_AUTH_CREDENTIALS) {
    SFAuthPost.append(field, SALESFORCE_AUTH_CREDENTIALS[field]);
  }

  let token;
  const SF_AUTH_URI = '/oauth2/token';
  try {
    const SFResponse = await axiosInstance.post(SF_AUTH_URI, SFAuthPost, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    token = SFResponse.data.access_token;
  } catch (err) {
    return err.response.data;
  }

  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

  return { success: true };
};

const getContact = async (paypalData) => {
  const contactQuery = [
    '/query/?q=SELECT',
    'Name,',
    'npsp__HHId__c,',
    'Id',
    'from',
    'Contact',
    'WHERE',
    'LastName',
    '=',
    `'${paypalData.last_name}'`,
    'AND',
    'Email',
    '=',
    `'${paypalData.payer_email}'`,
  ];

  const contactQueryUri = SF_API_PREFIX + contactQuery.join('+');

  try {
    const contactQueryResponse = await axiosInstance.get(contactQueryUri);
    if (contactQueryResponse.data.totalSize !== 0) {
      return contactQueryResponse.data.records[0];
    }
  } catch (err) {
    console.log(err.response.data);
    return;
  }
};

const addContact = async (paypalData) => {
  const contactToAdd = {
    FirstName: paypalData.first_name,
    LastName: paypalData.last_name,
    Email: paypalData.payer_email,
    Description:
      'Added into Salesforce by the Paypal server on ' +
      moment.utc(new Date().toJSON()).format('M/D/YY'),
  };

  // Insert call
  const contactInsertUri = SF_API_PREFIX + '/sobjects/Contact';
  let insertRes;
  try {
    insertRes = await axiosInstance.post(contactInsertUri, contactToAdd);

    //Query new contact to get household account number for opp
    if (insertRes.data.success) {
      const newContact = await axiosInstance.get(
        contactInsertUri + '/' + insertRes.data.id
      );
      return {
        Id: newContact.data.Id,
        npsp__HHId__c: newContact.data.npsp__HHId__c,
      };
    } else {
      console.log('Unable to insert contact!');
    }
  } catch (err) {
    console.log(err.response.data);
  }
};

const addRecurring = async (paypalData, contact) => {
  // check for recurring payment message
  //    payment_cycle: 'Monthly',
  //    txn_type: 'recurring_payment_profile_created',
  //    last_name: 'Downey',
  //    next_payment_date: '02:00:00 Nov 17, 2022 PST',
  //    residence_country: 'US',
  //    initial_payment_amount: '0.00',
  //    currency_code: 'USD',
  //    time_created: '14:38:45 Nov 17, 2022 PST',
  //    verify_sign: 'AfAHRKTCvmUAT7tItlo3UOlkc5vOAYUdOycluaYyw4tku0sVmUCejvQd',
  //    period_type: ' Regular',
  //    payer_status: 'verified',
  //    tax: '0.00',
  //    payer_email: 'thatsongsucks@hotmail.com',
  //    first_name: 'Deborah',
  //    receiver_email: 'maria@lukasoakland.com',
  //    payer_id: 'ZL69522VZ7GKN',
  //    product_type: '1',
  //    shipping: '0.00',
  //    amount_per_cycle: '1.00',
  //    profile_status: 'Active',
  //    charset: 'UTF-8',
  //    notify_version: '3.9',
  //    amount: '1.00',
  //    outstanding_balance: '0.00',
  //    recurring_payment_id: 'I-W58L68VCJAE7',
  //    product_name: 'donation',
  //    ipn_track_id: 'f727617a877a4'
  const formattedDate = formatDate(paypalData.time_created);

  let dayOfMonth = moment(formattedDate).format('D');
  if (
    parseInt(dayOfMonth) === 31 ||
    (moment(formattedDate).format('M') === '2' && parseInt(dayOfMonth) >= 28)
  ) {
    dayOfMonth = 'Last_Day';
  }

  const recurringToAdd = {
    npe03__Contact__c: contact.Id,
    npe03__Date_Established__c: formattedDate,
    npe03__Amount__c: paypalData.amount,
    npsp__RecurringType__c: 'Open',
    npsp__Day_of_Month__c: dayOfMonth,
    npe03__Installment_Period__c: paypalData.payment_cycle,
    npsp__StartDate__c: moment.utc(new Date().toJSON()).format(),
  };

  const recurringInsertUri =
    SF_API_PREFIX + '/sobjects/npe03__Recurring_Donation__c/';

  try {
    const response = await axiosInstance.post(
      recurringInsertUri,
      recurringToAdd
    );
    const summaryMessage = {
      success: response.data.success,
      name: `${paypalData.first_name} ${paypalData.last_name}`,
    };
    console.log('Recurring Donation Added: ' + JSON.stringify(summaryMessage));
  } catch (err) {
    console.log(err.response.data);
  }
};

const cancelRecurring = async (paypalData) => {
  let amt = paypalData.amount_per_cycle;
  const splitAmt = amt.split('.');
  if (splitAmt[1] === '00') {
    amt = splitAmt[0];
  } else if (splitAmt[1].split('')[1] == '0') {
    amt = splitAmt[0] + '.' + splitAmt[1].split('')[1];
  }

  const recurringQuery = [
    '/query/?q=SELECT',
    'Id',
    'from',
    'npe03__Recurring_Donation__c',
    'WHERE',
    'Name',
    '=',
    `'${paypalData.first_name} ${paypalData.last_name} $${amt} - Recurring'`,
  ];

  const recurringQueryUri = SF_API_PREFIX + recurringQuery.join('+');

  let existingRecurring;
  try {
    const recurringQueryResponse = await axiosInstance.get(recurringQueryUri);
    if (recurringQueryResponse.data.totalSize !== 0) {
      existingRecurring = recurringQueryResponse.data.records[0];
    }
  } catch (err) {
    console.log(err.response.data);
    return;
  }
  if (existingRecurring) {
    const recurringToUpdate = {
      npsp__Status__c: 'Closed',
      npsp__ClosedReason__c: paypalData.txn_type.replace('_', ' '),
      npsp__EndDate__c: moment().add(1, 'days'),
    };

    const recurringUpdateUri =
      SF_API_PREFIX +
      '/sobjects/npe03__Recurring_Donation__c/' +
      existingRecurring.Id;
    try {
      const response = await axiosInstance.patch(
        recurringUpdateUri,
        recurringToUpdate
      );
      const summaryMessage = {
        success: response.data.success,
        name: `${paypalData.first_name} ${paypalData.last_name}`,
      };
      console.log(
        'Recurring Donation Canceled: ' + JSON.stringify(summaryMessage)
      );
    } catch (err) {
      console.log(err.response.data);
    }
  } else {
    console.log('Recurring donation not found');
  }
};

const updateRecurringOpp = async (paypalData, contact, status) => {
  //   mc_gross: '1.00',
  //   outstanding_balance: '0.00',
  //   period_type: ' Regular',
  //   next_payment_date: '02:00:00 Dec 17, 2022 PST',
  //   protection_eligibility: 'Ineligible',
  //   tax: '0.00',
  // payer_id: 'ZL69522VZ7GKN',
  //   payment_date: '14:39:09 Nov 17, 2022 PST',
  //   payment_status: 'Completed',
  //   product_name: 'donation',
  //    charset: 'UTF-8',
  //    recurring_payment_id: 'I-W58L68VCJAE7',
  //   first_name: 'Deborah',
  //   mc_fee: '0.52',
  //   notify_version: '3.9',
  //     amount_per_cycle: '1.00',
  //   payer_status: 'verified',
  //   currency_code: 'USD',
  //   business: 'maria@lukasoakland.com',
  //   verify_sign: 'A27Y9Wm--6Rn7t9LW4WsgnffrMyHAEt7QNsEBb2czNH-fuU1BQUMcQYm',
  //   payer_email: 'thatsongsucks@hotmail.com',
  //   initial_payment_amount: '0.00',
  //    profile_status: 'Active',
  //       txn_id: '5T797629ES9689307',
  //    payment_type: 'instant',
  //       receiver_email: 'maria@lukasoakland.com',
  //       receiver_id: 'NSK6GEW3SV7HW',
  //      txn_type: 'recurring_payment',
  //      mc_currency: 'USD',
  //      residence_country: 'US',
  //  transaction_subject: 'donation',
  //      payment_gross: '1.00',
  //      shipping: '0.00',
  //      product_type: '1',
  //      time_created: '14:38:45 Nov 17, 2022 PST',
  //      ipn_track_id: 'f727617a877a4'

  // query donations to get ID
  const oppQuery = [
    '/query/?q=SELECT',
    'Id',
    'from',
    'Opportunity',
    'WHERE',
    'npsp__Primary_Contact__c',
    '=',
    `'${contact.Id}'`,
    'AND',
    'StageName',
    '=',
    `'Pledged'`,
  ];

  const oppQueryUri = SF_API_PREFIX + oppQuery.join('+');

  let existingOpp;
  try {
    const oppQueryResponse = await axiosInstance.get(oppQueryUri);
    if (oppQueryResponse.data.totalSize !== 0) {
      existingOpp = oppQueryResponse.data.records[0];
    }
  } catch (err) {
    console.log(err.response.data);
    return;
  }

  if (existingOpp) {
    const oppToUpdate = {
      StageName: status,
      Amount: paypalData.payment_gross,
    };

    const oppUpdateUri =
      SF_API_PREFIX + '/sobjects/Opportunity/' + existingOpp.Id;
    try {
      const response = await axiosInstance.patch(oppUpdateUri, oppToUpdate);
      const summaryMessage = {
        success: response.status === 204,
        name: `${paypalData.first_name} ${paypalData.last_name}`,
      };
      console.log('Donation Updated: ' + JSON.stringify(summaryMessage));
    } catch (err) {
      console.log(err.response.data);
    }

    return { success: true };
  } else {
    return console.log('Existing opportunity not found');
  }
};
const addDonation = async (paypalData, contact) => {
  // relevant data coming from paypal:
  // payment_gross - amount
  // payment_fee - fee
  // payment_date
  // payment_status
  // first_name
  // payer_email
  // payment_type = recurring?
  // item_name
  // item_number

  const formattedDate = formatDate(paypalData.payment_date);

  const oppToAdd = {
    Amount: paypalData.payment_gross,
    AccountId: contact.npsp__HHId__c,
    npsp__Primary_Contact__c: contact.Id,
    StageName: 'Posted',
    CloseDate: formattedDate,
    Name: `${paypalData.first_name} ${paypalData.last_name} Donation ${moment(
      formattedDate
    ).format('M/D/YYYY')}`,
    RecordTypeId: '0128Z000001BIZJQA4',
    Description:
      'Added into Salesforce by the Paypal server on ' +
      moment.utc(new Date().toJSON()).format('M/D/YY'),
    Processing_Fee__c: paypalData.payment_fee,
  };

  const oppInsertUri = SF_API_PREFIX + '/sobjects/Opportunity';
  try {
    const response = await axiosInstance.post(oppInsertUri, oppToAdd);
    const summaryMessage = {
      success: response.data.success,
      amount: oppToAdd.Amount,
      name: `${paypalData.first_name} ${paypalData.last_name}`,
      date: paypalData.payment_date,
    };
    console.log('Donation Added: ' + JSON.stringify(summaryMessage));
  } catch (err) {
    console.log(err.response.data);
  }
};

module.exports = paypalRouter;
