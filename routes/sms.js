const express = require('express');
const twilio = require('twilio');

const getSecrets = require('../services/getSecrets');

const smsRouter = express.Router();

smsRouter.get('/sms', async (req, res) => {
  const secrets = await getSecrets(['TWILIO_ID', 'TWILIO_TOKEN']);
  const twilioClient = new twilio.Twilio(
    secrets.TWILIO_ID,
    secrets.TWILIO_TOKEN
  );
  twilioClient.messages.create(
    {
      body: 'testicles',
      to: '+14158190251',
      from: '+14782495048',
    },
    (err) => {
      if (err) {
        return res.status(422).send({ error: err });
      }
      res.send('Message Sent!');
    }
  );
});

module.exports = smsRouter;
