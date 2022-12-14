const express = require('express');
const twilio = require('twilio');
const { Phone, REGIONS } = require('../models/phone');

const { currentUser } = require('../middlewares/current-user.js');
const { requireAuth } = require('../middlewares/require-auth.js');
const { requireAdmin } = require('../middlewares/require-admin');
const getSecrets = require('../services/getSecrets');

const smsRouter = express.Router();

smsRouter.post(
  '/text/outgoing',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const secrets = await getSecrets(['TWILIO_ID', 'TWILIO_AUTH_TOKEN']);
    const twilioClient = new twilio.Twilio(
      secrets.TWILIO_ID,
      secrets.TWILIO_AUTH_TOKEN
    );

    const { message, region } = req.body;

    if (!message) {
      res.status(422);
      throw new Error('No message to send');
    }

    if (!region) {
      res.status(422);
      throw new Error('No region specified');
    }

    const responsePhoneNumber = REGIONS[region].phoneNumber;

    const allPhoneNumbers = await Phone.find({ region });

    const formattedNumbers = allPhoneNumbers.map((p) => p.number);

    const textPromises = formattedNumbers.map((pn) => {
      return twilioClient.messages.create({
        body: message,
        to: pn,
        from: responsePhoneNumber,
      });
    });

    await Promise.all(textPromises);

    res.send(message);
  }
);

module.exports = smsRouter;
