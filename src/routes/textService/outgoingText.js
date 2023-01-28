const express = require('express');
const twilio = require('twilio');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

const { Phone, REGIONS } = require('../../models/phone');
const { currentUser } = require('../../middlewares/current-user.js');
const { requireAuth } = require('../../middlewares/require-auth.js');
const { requireAdmin } = require('../../middlewares/require-admin');
const getSecrets = require('../../services/getSecrets');
const urls = require('../../services/urls');

const smsRouter = express.Router();

smsRouter.post(
  '/outgoing',
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

    const responsePhoneNumber = REGIONS[region];

    const allPhoneNumbers = await Phone.find({ region });

    const formattedNumbers = allPhoneNumbers.map((p) => p.number);
    // const formattedNumbers = ['+14158190251'];

    const outgoingText = {
      body: message,
      from: responsePhoneNumber,
    };

    if (req.files?.photo) {
      const fileName =
        moment().format('YYYY-MM-DD hh:ss a') +
        path.extname(req.files.photo.name);
      const imagePath = 'images/outgoingText/' + fileName;
      const stream = fs.createWriteStream(imagePath);
      stream.write(req.files.photo.data);
      stream.end();
      outgoingText.MediaUrl = path.join(urls.server, imagePath);
    }

    const createOutgoingText = async (phone) => {
      await twilioClient.messages.create({ ...outgoingText, to: phone });
    };
    const textPromises = formattedNumbers.map(createOutgoingText);
    await Promise.all(textPromises);

    res.send({ message, region, photoUrl: outgoingText?.MediaUrl });
  }
);

module.exports = smsRouter;
