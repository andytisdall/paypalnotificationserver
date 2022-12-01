const express = require('express');
const twilio = require('twilio');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const router = express.Router();

router.post('/incoming-sms', twilio.webhook(), (req, res) => {
  const response = new MessagingResponse();

  response.message(
    `Your text to me was ${req.body.Body.length} characters long. Webhooks are neat :)`
  );

  res.set('Content-Type', 'text/xml');
  res.send(response.toString());
});

module.exports = router;
