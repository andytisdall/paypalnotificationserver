const express = require('express');
const twilio = require('twilio');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const router = express.Router();

router.post('/incoming-sms', twilio.webhook({protocol: 'https'}), (req, res) => {
  const response = new MessagingResponse();
        // ToCountry: 'US',
        // ToState: 'GA',
        // SmsMessageSid: 'SMc34361cba5c8feeb5e29d309bc9932a3',
        // NumMedia: '0',
        // ToCity: '',
        // FromZip: '94945',
        // SmsSid: 'SMc34361cba5c8feeb5e29d309bc9932a3',
        // FromState: 'CA',
        // SmsStatus: 'received',
        // FromCity: 'SAN FRANCISCO',
        // Body: 'Geeee',
        // FromCountry: 'US',
        // To: '+14782495048',
        // ToZip: '',
        // NumSegments: '1',
        // ReferralNumMedia: '0',MessageSid: 'SMc34361cba5c8feeb5e29d309bc9932a3',
        // AccountSid: 'AC575b987418ed71997c08f3c98c861103',
        // From: '+14158190251',
        // ApiVersion: '2010-04-01'

  response.message(
    `Your text to me was ${req.body.Body.length} characters long. Webhooks are neat :)`
  );

  res.set('Content-Type', 'text/xml');
  res.send(response.toString());
});

module.exports = router;
