const express = require('express');
const axios = require('axios');
const moment = require('moment');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const SALESFORCE_URI_PREFIX =
  'https://communitykitchens.my.salesforce.com/services';


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

  //   const paypalUrl = 'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr';
  //   const verificationPost = new URLSearchParams();
  //   verificationPost.append('cmd', '_notify_validate');
  //   for (field in req.body) {
  //     verificationPost.append(field, req.body[field]);
  //   }

  //   try {
  //     const paypalResponse = await axios.post(paypalUrl, verificationPost, {
  //       headers: {
  //         'User-Agent': 'Node-IPN-VerificationScript',
  //       },
  //     });

  //     // console.log(paypalResponse);
  //     if (paypalResponse.data !== 'VERIFIED') {
  //       console.log(paypalResponse);
  //       return;
  //     } else {
  //       console.log('succccess');
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     return;
  //   }

  // get token from salesforce
  const secrets = {};
  const secretClient = new SecretManagerServiceClient();
  // error if not in cloud env
  try {
    const projectId = await secretClient.getProjectId();
    if (projectId) {
      const getSecret = async (name) => {
        const [version] = await secretClient.accessSecretVersion({
          name: `projects/385802469502/secrets/${name}/versions/latest`,
        });
        return version.payload.data.toString();
      };
      secrets.SF_CLIENT_ID = await getSecret('SF_CLIENT_ID');
      secrets.SF_CLIENT_SECRET = await getSecret('SF_CLIENT_SECRET');
    } else {
      throw Error();
    }
  } catch {
    secrets.SF_CLIENT_ID = require('../keys').CONSUMER_KEY;
    secrets.SF_CLIENT_SECRET = require('../keys').CONSUMER_SECRET;
  }

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
  const SFAuthUri = SALESFORCE_URI_PREFIX + '/oauth2/token';
  try {
    const SFResponse = await axios.post(SFAuthUri, SFAuthPost);
    token = SFResponse.data.access_token;
  } catch (err) {
    console.log(err.response.data);
    return;
  }

  // make api call to salesforce

  const SFApiPrefix = SALESFORCE_URI_PREFIX + '/data/v56.0';
  const SFHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Check if contact exists

  const contactQuery = [
    '/query/?q=SELECT',
    'Name,',
    'npsp__HHId__c,',
    'Id',
    'from',
    'Contact',
    'WHERE',
    'FirstName',
    '=',
    `'${paypalData.first_name}'`,
    'AND',
    'LastName',
    '=',
    `'${paypalData.last_name}'`,
  ];

  const contactQueryUri = SFApiPrefix + contactQuery.join('+');

  let existingContact;
  try {
    const contactQueryResponse = await axios.get(contactQueryUri, {
      headers: SFHeaders,
    });
    if (contactQueryResponse.data.totalSize !== 0) {
      existingContact = contactQueryResponse.data.records[0];
    }
  } catch (err) {
    console.log(err.response.data);
    return;
  }

  // insert contact if necessary

  if (!existingContact) {
    // contact needs to be added first so that opp can have a contactid

    const contactToAdd = {
      FirstName: paypalData.first_name,
      LastName: paypalData.last_name,
      Email: paypalData.payer_email,
      Description:
        'Added into Salesforce by the Paypal server on ' +
        moment.utc(new Date().toJSON()).format('MM/DD/YY'),
    };

    // Insert call
    const contactInsertUri = SFApiPrefix + '/sobjects/Contact';
    let insertRes;
    try {
      insertRes = await axios.post(contactInsertUri, contactToAdd, {
        headers: SFHeaders,
      });
    } catch (err) {
      return console.log(err.response.data);
    }

    //Query new contact to get household account number for opp
    if (insertRes.data.success) {
      try {
        const newContact = await axios.get(
          contactInsertUri + '/' + insertRes.data.id,
          {
            headers: SFHeaders,
          }
        );
        existingContact = {
          Id: newContact.data.Id,
          npsp__HHId__c: newContact.data.npsp__HHId__c,
        };
      } catch (err) {
        return console.log(err.insertRes.data);
      }
    } else {
      return console.log('Unable to insert contact!');
    }
  }

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

  if (paypalData.txn_type === 'recurring_payment_profile_created') {

    const formattedDate = moment.utc(new Date(paypalData.time_created), 'HH:mm:ss MMM D, YYYY');
    const recurringToAdd = {
        npe03__Contact__c: existingContact.Id,
        npe03__Date_Established__c: formattedDate.format(),
        npe03__Amount__c: paypalData.amount,
        npsp__RecurringType__c: 'Open',
        npsp__Day_of_Month__c: formattedDate.format('D'),
        npe03__Installment_Period__c: paypalData.payment_cycle,
        npsp__StartDate__c: moment.utc(new Date().toJSON()).format()
    }

    const recurringInsertUri = SFApiPrefix + '/sobjects/npe03__Recurring_Donation__c/';
    try {
        const response = await axios.post(recurringInsertUri, recurringToAdd, {
          headers: SFHeaders,
        });
        const summaryMessage = {
          success: response.data.success,
          name: `${paypalData.first_name} ${paypalData.last_name}`
        };
        console.log('Recurring Donation Added: ' + JSON.stringify(summaryMessage));
      } catch (err) {
        console.log(err.response.data);
      }

    return;
  }

  const canceledSubscriptionStatuses = [
      'recurring_payment_suspended_due_to_max_failed_payment',
      'recurring_payment_profile_cancel',
      'recurring_payment_expired',
      'recurring_payment_suspended',
      'recurring_payment_failed'
  ]

  if (canceledSubscriptionStatuses.includes(paypalData.txn_type)) {

    let amt = paypalData.amount_per_cycle
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
        `'${paypalData.first_name} ${paypalData.last_name} $${amt} - Recurring'`
      ];
    
      const recurringQueryUri = SFApiPrefix + recurringQuery.join('+');
    
      let existingRecurring;
      try {
        const recurringQueryResponse = await axios.get(recurringQueryUri, {
          headers: SFHeaders,
        });
        if (recurringQueryResponse.data.totalSize !== 0) {
          existingRecurring = recurringQueryResponse.data.records[0];
        }
      } catch (err) {
        console.log(err.response.data);
        return;
      }
      if (existingRecurring) {

    const recurringToUpdate = {
        npsp__Status__c: paypalData.txn_type === 'recurring_payment_failed' ? 'Paused' : 'Closed',
        npsp__ClosedReason__c: paypalData.txn_type.replace('_', ' ')
    }

    const recurringUpdateUri = SFApiPrefix + '/sobjects/npe03__Recurring_Donation__c/' + existingRecurring.Id;
    try {
        const response = await axios.patch(recurringUpdateUri, recurringToUpdate, {
          headers: SFHeaders,
        });
        const summaryMessage = {
          success: response.data.success,
          name: `${paypalData.first_name} ${paypalData.last_name}`,
        };
        console.log('Recurring Donation Canceled: ' + JSON.stringify(summaryMessage));
      } catch (err) {
        console.log(err.response.data);
      }
    } else {
        console.log('Recurring donation not found')
    }
    return;
  }

// catch all clause for unknown transaction type

if (!paypalData.payment_date) {
    return console.log('Unknown type of message: no payment date')
}

  // if donation is recurring, pledged opp will already exist in sf
  // update payment amount and stage

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
  const splitDate = paypalData.payment_date
    .split(' ')
    .filter((el, i, a) => i !== a.length - 1);
const formattedDate = moment
.utc(splitDate, 'HH:mm:ss MMM D, YYYY')
.format();


if (paypalData.amount_per_cycle) {
// query donations to get ID
const oppQuery = [
    '/query/?q=SELECT',
    'Id',
    'from',
    'Opportunity',
    'WHERE',
    'Name',
    '=',
    `'${paypalData.first_name} ${paypalData.last_name} Donation ${moment.utc(formattedDate).format('MM/DD/YYYY')}'`
  ];

  const oppQueryUri = SFApiPrefix + oppQuery.join('+');

  let existingOpp;
  try {
    const oppQueryResponse = await axios.get(oppQueryUri, {
      headers: SFHeaders,
    });
    if (oppQueryResponse.data.totalSize !== 0) {
      existingOpp = oppQueryResponse.data.records[0];
    }
  } catch (err) {
    console.log(err.response.data);
    return;
  }
    
if (existingOpp) {  

    const oppToUpdate = {
        StageName: 'Posted',
        Amount: paypalData.payment_gross
    }

    const oppUpdateUri = SFApiPrefix + '/sobjects/npe03__Recurring_Donation__c/' + existingOpp.Id;
    try {
        const response = await axios.patch(oppUpdateUri, oppToUpdate, {
          headers: SFHeaders,
        });
        const summaryMessage = {
          success: response.data.success,
          name: `${paypalData.first_name} ${paypalData.last_name}`
        };
        console.log('Donation Updated: ' + JSON.stringify(summaryMessage));
      } catch (err) {
        console.log(err.response.data);
      }

    return;

    }
  }

  // insert opportunity

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





  const oppToAdd = {
    Amount: paypalData.payment_gross,
    AccountId: existingContact.npsp__HHId__c,
    npsp__Primary_Contact__c: existingContact.Id,
    StageName: 'Posted',
    CloseDate: formattedDate,
    Name: `${paypalData.first_name} ${paypalData.last_name} Donation ${moment(
      formattedDate
    ).format('MM/DD/YYYY')}`,
    RecordTypeId: '0128Z000001BIZJQA4',
    Description:
      'Added into Salesforce by the Paypal server on ' +
      moment.utc(new Date().toJSON()).format('MM/DD/YY'),
    Processing_Fee__c: paypalData.payment_fee
  };

  const oppInsertUri = SFApiPrefix + '/sobjects/Opportunity';
  try {
    const response = await axios.post(oppInsertUri, oppToAdd, {
      headers: SFHeaders,
    });
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

  // OPPORTUNITY
  // Amount
  // AccountId = exisingUser.npsp__HHId__c
  // npsp__Primary_Contact__c = existingUser.Id
  // StageName - required = 'Posted'
  // CloseDate - required = payment_date
  // Name - required = `${first_name} ${last_name} Donation ${moment.utc(payment_date).format('MM/DD/YYYY')}`
  // RecordTypeId = 0128Z000001BIZJQA4
  // Description = 'Added into Salesforce by the Paypal server on ' + moment.utc(new Date().toJSON()).format('MM/DD/YY')
});

module.exports = paypalRouter;
