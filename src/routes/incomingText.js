const express = require('express');
const twilio = require('twilio');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const { Phone, REGIONS } = require('../models/phone');
const { sendEmailToSelf } = require('../services/email');
const textResponses = require('../services/textResponses');

const router = express.Router();

router.post(
  '/text/incoming',
  twilio.webhook({ protocol: 'https' }),
  async (req, res) => {
    const response = new MessagingResponse();

    const responseMessage = await routeTextToResponse(req.body);
    if (!responseMessage) {
      return res.sendStatus(200);
    }

    response.message(responseMessage);

    res.set('Content-Type', 'text/xml');
    return res.send(response.toString());
  }
);

const routeTextToResponse = async ({ Body, From, To }) => {
  const region = Object.keys(REGIONS).find((reg) => REGIONS[reg] === To);

  const keyword = Body.toLowerCase().replace(' ', '');

  if (textResponses.SIGN_UP_WORDS.includes(keyword)) {
    return await addPhoneNumber(From, region);
  }

  if (textResponses.CANCEL_WORDS.includes(keyword)) {
    await removePhoneNumber(From, region);
    return null;
  }

  if (textResponses.INFO_WORD === keyword) {
    return textResponses.generalInfoResponse(region);
  }

  await sendEmailToSelf({
    subject: 'Feedback Text Received',
    message: `Received from ${From}: ${Body}`,
  });
  return textResponses.feedbackResponse();
};

const addPhoneNumber = async (number, region) => {
  const existingNumber = await Phone.findOne({ number });
  if (existingNumber) {
    if (existingNumber.region.includes(region)) {
      return textResponses.duplicateResponse(region);
    } else {
      existingNumber.region.push(region);
      await existingNumber.save();
    }
  } else {
    const newPhone = new Phone({ number, region: [region] });
    await newPhone.save();
  }
  return textResponses.signUpResponse(region);
};

const removePhoneNumber = async (number, region) => {
  const existingNumber = await Phone.findOne({ number });

  if (existingNumber) {
    existingNumber.region = existingNumber.region.filter((r) => r !== region);
    await existingNumber.save();
  }
};

module.exports = router;
