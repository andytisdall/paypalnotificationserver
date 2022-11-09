const express = require('express');
// const keys = require('./keys');
const axios = require('axios');
const mysql = require('mysql');

const dbUrl = process.env.JAWSDB_URL || '';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const SALESFORCE_AUTH_ENDPOINT =
  'https://communitykitchens.my.salesforce.com/services/oauth2/token';

const SFPostBody = new URLSearchParams();
// SFPostBody.append('client_id', keys.CONSUMER_KEY);
// SFPostBody.append('client_secret', keys.CONSUMER_SECRET);
// SFPostBody.append('grant_type', 'client_credentials');

app.post('/', async (req, res) => {
  // send paypal back a 200
  res.sendStatus(200);

  // get address to post verification
  const paypalUrl = 'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr';

  // post a verification to paypal
  try {
    const paypalResponse = await axios.post(paypalUrl, req.body);

    console.log(paypalResponse);
    if (paypalResponse.data !== 'VERIFIED') {
      console.log(paypalResponse.data);
      return;
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
  //   const SFResponse = await axios.post(SALESFORCE_AUTH_ENDPOINT, SFPostBody);
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

app.listen(3000, () => {
  console.log('server listening');
});
