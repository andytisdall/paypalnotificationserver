const express = require('express');
const twilio = require('twilio');
const { Phone } = require('../models/phone');

const { currentUser } = require('../middlewares/current-user.js');
const { requireAuth } = require('../middlewares/require-auth.js');
const getSecrets = require('../services/getSecrets');

const smsRouter = express.Router();

smsRouter.post('/sms', currentUser, requireAuth, async (req, res) => {
  const secrets = await getSecrets(['TWILIO_ID', 'TWILIO_TOKEN']);
  const twilioClient = new twilio.Twilio(
    secrets.TWILIO_ID,
    secrets.TWILIO_TOKEN
  );

  if (!req.body.message) {
    return res.status(422).send('No message to send');
  }

  const allPhoneNumbers = await Phone.find();

  const formattedNumbers = allPhoneNumbers.map((p) => p.number);

  formattedNumbers.forEach((pn) => {
    twilioClient.messages.create(
      {
        body: req.body.message,
        to: pn,
        from: '+14782495048',
      },
      (err) => {
        if (err) {
          return res.status(422).send(err.message);
        }
        res.send('Message Sent!');
      }
    );
  });
});

module.exports = smsRouter;
