const express = require('express');
const axios = require('axios');
const mysql = require('mysql');
const cors = require('cors');
const moment = require('moment');

// get environment variables
const SF_CLIENT_ID = process.env.SF_CLIENT_ID || require('./keys').CONSUMER_KEY;
const SF_CLIENT_SECRET =
  process.env.SF_CLIENT_SECRET || require('./keys').CONSUMER_SECRET;
// const dbUrl = process.env.JAWSDB_URL || '';
const PORT = process.env.PORT || 3000;

// initialize app and add middleware
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// get info to get auth token from salesforce
const SALESFORCE_AUTH_CREDENTIALS = {
  client_id: SF_CLIENT_ID,
  client_secret: SF_CLIENT_SECRET,
  grant_type: 'client_credentials',
};

const SALESFORCE_URI_PREFIX =
  'https://communitykitchens.my.salesforce.com/services';

const SFAuthPost = new URLSearchParams();
for (field in SALESFORCE_AUTH_CREDENTIALS) {
  SFAuthPost.append(field, SALESFORCE_AUTH_CREDENTIALS[field]);
}

// listener for paypal message
app.post('/', async (req, res) => {
  // send paypal back a 200
  res.sendStatus(200);

  // post a verification to paypal

  // const paypalUrl = 'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr';
  // const verificationPost = new URLSearchParams();
  // verificationPost.append('cmd', '_notify_validate');
  // for (field in req.body) {
  //   verificationPost.append(field, req.body[field]);
  // }

  // try {
  //   const paypalResponse = await axios.post(paypalUrl, verificationPost, {
  //     headers: {
  //       'User-Agent': 'Node-IPN-VerificationScript',
  //     },
  //   });

  //   // console.log(paypalResponse);
  //   if (paypalResponse.data !== 'VERIFIED') {
  //     console.log(paypalResponse);
  //     return;
  //   } else {
  //     console.log('succccess');
  //   }
  // } catch (err) {
  //   console.log(err);
  //   return;
  // }

  // check message against db for duplicates

  // save message in db

  // get token from salesforce
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

  const paypalData = req.body;
  console.log(paypalData);

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
    const response = await axios.post(contactInsertUri, contactToAdd, {
      headers: SFHeaders,
    });

    //Query new contact to get household account number for opp
    if (response.data.success) {
      try {
        const newContact = await axios.get(
          contactInsertUri + '/' + response.data.id,
          {
            headers: SFHeaders,
          }
        );
        existingContact = {
          Id: newContact.data.Id,
          npsp__HHId__c: newContact.data.npsp__HHId__c,
        };
      } catch (err) {
        return console.log(err.response.data);
      }
    } else {
      return console.log('Unable to insert contact!');
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
  // payment_type
  // item_name
  // item_number

  const oppToAdd = {
    Amount: paypalData.payment_gross,
    AccountId: existingUser.npsp__HHId__c,
    npsp__Primary_Contact__c: existingUser.Id,
    StageName: 'Posted',
    CloseDate: paypalData.payment_date,
    Name: `${first_name} ${last_name} Donation ${moment
      .utc(payment_date)
      .format('MM/DD/YYYY')}`,
    RecordTypeId: '0128Z000001BIZJQA4',
    Description:
      'Added into Salesforce by the Paypal server on ' +
      moment.utc(new Date().toJSON()).format('MM/DD/YY'),
  };

  const oppInsertUri = SFApiPrefix + '/sobjects/Opportunity';
  const response = await axios.post(oppInsertUri, oppToAdd, {
    headers: SFHeaders,
  });

  console.log(response.data);

  // OPPORTUNITY
  // Amount
  // AccountId = exisingUser.npsp__HHId__c
  // npsp__Primary_Contact__c = existingUser.Id
  // StageName - required = 'Posted'
  // CloseDate - required = payment_date
  // Name - required = `${first_name} ${last_name} Donation ${moment.utc(payment_date).format('MM/DD/YYYY')}`
  // RecordTypeId = 0128Z000001BIZJQA4
  // Description = 'Added into Salesforce by the Paypal server on ' + moment.utc(new Date().toJSON()).format('MM/DD/YY')

  // mark db entry as successful
});

// const db = mysql.createConnection(dbUrl);
// db.connect();

// db.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
//   if (err) throw err;

//   console.log('The solution is: ', rows[0].solution);
// });

// db.end();

app.get('/', (req, res) => {
  res.send('~paypal server~!');
});

app.listen(PORT, () => {
  console.log('server listening');
});
