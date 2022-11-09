const express = require('express');
const axios = require('axios');
const mysql = require('mysql');
const e = require('express');

// get environment variables
const SF_CLIENT_ID = process.env.SF_CLIENT_ID || require('keys').CONSUMER_KEY;
const SF_CLIENT_SECRET =
  process.env.SF_CLIENT_SECRET || require('keys').CONSUMER_SECRET;
const dbUrl = process.env.JAWSDB_URL || '';
const PORT = process.env.PORT || 3000;

// initialize app and add middleware
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// get info to get auth token from salesforce
const SALESFORCE_AUTH_CREDENTIALS = {
  client_id: SF_CLIENT_ID,
  client_secret: SF_CLIENT_SECRET,
  grant_type: 'client_credentials',
};
const SALESFORCE_AUTH_ENDPOINT =
  'https://communitykitchens.my.salesforce.com/services/oauth2/token';
const SFAuthPost = new URLSearchParams();
for (field in SALESFORCE_AUTH_CREDENTIALS) {
  SFAuthPost.append(field, SALESFORCE_AUTH_CREDENTIALS[field]);
}

// listener for paypal message
app.post('/', async (req, res) => {
  // send paypal back a 200
  res.sendStatus(200);

  // get address to post verification
  const paypalUrl = 'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr';

  // post a verification to paypal
  try {
    const verificationPost = new URLSearchParams();
    verificationPost.append('cmd', '_notify_validate');
    for (field in req.body) {
      verificationPost.append(field, req.body[field]);
    }

    const paypalResponse = await axios.post(paypalUrl, verificationPost, {
      headers: {
        'User-Agent': 'Node-IPN-VerificationScript',
      },
    });

    console.log(paypalResponse);
    if (paypalResponse.data !== 'VERIFIED') {
      console.log(paypalResponse);
      return;
    } else {
      console.log('succccess');
    }
  } catch (err) {
    console.log(err.response.data);
    return;
  }

  // check message against db for duplicates

  // save message in db

  // get token from salesforce
  let token;
  // try {
  //   const SFResponse = await axios.post(SALESFORCE_AUTH_ENDPOINT, SFAuthPost);
  //   token = SFResponse.data.token;
  // } catch (err) {
  //   console.log(err.response.data);
  //   return;
  // }

  // make api call to salesforce

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
