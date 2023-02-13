import express from 'express';
import moment from 'moment';
import mongoose from 'mongoose';

import { sendDonationAckEmail } from '../../services/email';
import { addContact, Contact } from '../../services/salesforce/SFQuery';
import urls from '../../services/urls';
import fetcher from '../../services/fetcher';

const PaypalTxn = mongoose.model('PaypalTxn');
const paypalRouter = express.Router();

interface PaypalData {
  payment_cycle?: string;
  last_name: string;
  txn_type: string;
  payer_email: string;
  first_name: string;
  amount_per_cycle?: string;
  amount?: string;
  payment_gross: string;
  payment_fee?: string;
  ipn_track_id: string;
  payment_date?: string;
  time_created: string;
}

interface SFInsertResponse {
  success: boolean;
  id: string;
}

// listener for paypal message
paypalRouter.post('/paypal', async (req, res) => {
  // return early if it's not a donation

  const paypalData: PaypalData = req.body;
  // console.log(paypalData);

  // check for already processed transaction
  const existingTxn = await PaypalTxn.findOne({
    txnId: paypalData.ipn_track_id,
  });
  if (existingTxn) {
    console.log('Already processed this transaction, this is a duplicate');
    return res.sendStatus(200);
  }

  if (paypalData.payment_gross && parseFloat(paypalData.payment_gross) < 0) {
    console.log('not a credit');
    return res.sendStatus(200);
  }

  // post a verification to paypal - not working
  // verifyPaypalMessage(paypalData);

  await fetcher.setService('salesforce');

  // Check if contact exists
  let existingContact = await getContactByEmail(paypalData.payer_email);

  if (!existingContact) {
    // contact needs to be added first so that opp can have a contactid
    const contactToAdd = {
      FirstName: paypalData.first_name,
      LastName: paypalData.last_name,
      Email: paypalData.payer_email,
    };
    existingContact = await addContact(contactToAdd);
  }

  const canceledSubscriptionStatuses = [
    'recurring_payment_suspended_due_to_max_failed_payment',
    'recurring_payment_profile_cancel',
    'recurring_payment_expired',
    'recurring_payment_suspended',
    'recurring_payment_failed',
  ];

  if (paypalData.txn_type === 'recurring_payment_profile_created') {
    await addRecurring(paypalData, existingContact);
  } else if (paypalData.txn_type === 'recurring_payment_skipped') {
    await updateRecurringOpp(paypalData, existingContact, 'Closed Lost');
  } else if (canceledSubscriptionStatuses.includes(paypalData.txn_type)) {
    await cancelRecurring(paypalData, existingContact);
  } else if (!paypalData.payment_date) {
    // catch all clause for unknown transaction type
    console.log('Unknown type of message: no payment date');
  } else if (paypalData.amount_per_cycle) {
    // if donation is recurring, pledged opp will already exist in sf
    // update payment amount and stage
    await updateRecurringOpp(paypalData, existingContact, 'Posted');
  } else {
    // insert opportunity
    await addDonation(paypalData, existingContact);
  }

  // thank you email

  await sendDonationAckEmail(paypalData);

  const newTxn = new PaypalTxn({ txnId: paypalData.ipn_track_id });
  await newTxn.save();
  // send paypal back a 200
  res.sendStatus(200);
});

const formatDate = (date: string) => {
  const splitDate = date.split(' ').filter((el, i, a) => i !== a.length - 1);
  return moment(splitDate, 'HH:mm:ss MMM D, YYYY').format();
};

// const verifyPaypalMessage = async (paypalData: PaypalData) => {
//   const paypalUrl = 'https://ipnpb.paypal.com/cgi-bin/webscr';
//   const verificationPost = new URLSearchParams();
//   verificationPost.append('cmd', '_notify_validate');
//   for (let field in paypalData) {
//     verificationPost.append(field, paypalData[field]);
//   }

//   try {
//     const paypalResponse = await axiosInstance.post(
//       paypalUrl,
//       verificationPost,
//       {
//         headers: {
//           'User-Agent': 'Node-IPN-VerificationScript',
//         },
//       }
//     );

//     // console.log(paypalResponse);
//     if (paypalResponse.data !== 'VERIFIED') {
//       console.log(paypalResponse);
//       return { success: true };
//     } else {
//       console.log('succccess');
//     }
//   } catch (err) {
//     paypalErrorReport(err);
//     return;
//   }
// };

const addRecurring = async (paypalData: PaypalData, contact: Contact) => {
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
    npe03__Contact__c: contact.id,
    npe03__Date_Established__c: formattedDate,
    npe03__Amount__c: paypalData.amount,
    npsp__RecurringType__c: 'Open',
    npsp__Day_of_Month__c: dayOfMonth,
    npe03__Installment_Period__c: paypalData.payment_cycle,
    npsp__StartDate__c: moment().format(),
  };

  const recurringInsertUri =
    urls.SFOperationPrefix + '/npe03__Recurring_Donation__c/';

  const response = await fetcher.instance.post(
    recurringInsertUri,
    recurringToAdd
  );
  const summaryMessage = {
    success: response.data.success,
    name: `${paypalData.first_name} ${paypalData.last_name}`,
  };
  console.log('Recurring Donation Added: ' + JSON.stringify(summaryMessage));
};

const cancelRecurring = async (paypalData: PaypalData, contact: Contact) => {
  const recurringQuery = [
    'SELECT',
    'Id',
    'from',
    'npe03__Recurring_Donation__c',
    'WHERE',
    'npe03__Contact__c',
    '=',
    `'${contact.id}'`,
  ];

  const recurringQueryUri = urls.SFQueryPrefix + recurringQuery.join('+');

  let existingRecurring;
  const recurringQueryResponse = await fetcher.instance.get(recurringQueryUri);
  if (recurringQueryResponse.data.totalSize !== 0) {
    existingRecurring = recurringQueryResponse.data.records[0];
  }

  if (existingRecurring) {
    const recurringToUpdate = {
      npsp__Status__c: 'Closed',
      npsp__ClosedReason__c: paypalData.txn_type.replace(/_/gi, ' '),
      npsp__EndDate__c: moment().add(1, 'days'),
    };

    const recurringUpdateUri =
      urls.SFOperationPrefix +
      '/npe03__Recurring_Donation__c/' +
      existingRecurring.Id;

    const response = await fetcher.instance.patch(
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
  } else {
    console.log('Recurring donation not found');
  }
};

const updateRecurringOpp = async (
  paypalData: PaypalData,
  contact: Contact,
  status: 'Closed Lost' | 'Posted'
) => {
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
    'SELECT',
    'Id',
    'from',
    'Opportunity',
    'WHERE',
    'npsp__Primary_Contact__c',
    '=',
    `'${contact.id}'`,
    'AND',
    'StageName',
    '=',
    `'Pledged'`,
  ];

  const oppQueryUri = urls.SFQueryPrefix + oppQuery.join('+');

  let existingOpp;

  const oppQueryResponse = await fetcher.instance.get(oppQueryUri);
  if (oppQueryResponse.data.totalSize !== 0) {
    existingOpp = oppQueryResponse.data.records[0];
  }

  if (existingOpp) {
    const oppToUpdate = {
      StageName: status,
      Amount: paypalData.payment_gross,
    };

    const oppUpdateUri =
      urls.SFOperationPrefix + '/Opportunity/' + existingOpp.Id;

    const response = await fetcher.instance.patch(oppUpdateUri, oppToUpdate);
    const summaryMessage = {
      success: response.status === 204,
      name: `${paypalData.first_name} ${paypalData.last_name}`,
    };
    console.log('Donation Updated: ' + JSON.stringify(summaryMessage));
  } else {
    return console.log('Existing opportunity not found');
  }
};
const addDonation = async (paypalData: PaypalData, contact: Contact) => {
  // relevant data coming from paypal:
  // payment_gross - amount
  // payment_fee - fee
  // payment_date
  // payment_status
  // first_name
  // payer_email
  if (!paypalData.payment_date) {
    throw Error('Could not add donation without a payment date');
  }

  const formattedDate = formatDate(paypalData.payment_date);

  const oppToAdd = {
    Amount: paypalData.payment_gross,
    AccountId: contact.householdId,
    npsp__Primary_Contact__c: contact.id,
    StageName: 'Posted',
    CloseDate: formattedDate,
    Name: `${paypalData.first_name} ${paypalData.last_name} Donation ${moment(
      formattedDate
    ).format('M/D/YYYY')}`,
    RecordTypeId: '0128Z000001BIZJQA4',
    Processing_Fee__c: paypalData.payment_fee,
  };

  const oppInsertUri = urls.SFOperationPrefix + '/Opportunity';

  const response = await fetcher.instance.post(oppInsertUri, oppToAdd);
  const summaryMessage = {
    success: response.data.success,
    amount: oppToAdd.Amount,
    name: `${paypalData.first_name} ${paypalData.last_name}`,
    date: paypalData.payment_date,
  };
  console.log('Donation Added: ' + JSON.stringify(summaryMessage));
};

// this contact query just searches by email because people's names and
// email addresses don't always match up on paypal

const getContactByEmail = async (email: string) => {
  const query = `SELECT Name, npsp__HHId__c, Id from Contact WHERE Email = '${email}'`;
  const contactQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const contactQueryResponse = await fetcher.instance.get(contactQueryUri);
  if (contactQueryResponse.data?.records?.length === 0) {
    return null;
  }
  const contact = contactQueryResponse.data.records[0];
  return {
    id: contact.Id,
    householdId: contact.npsp__HHId__c,
  };
};

export default paypalRouter;
