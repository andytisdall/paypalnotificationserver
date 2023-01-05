const express = require('express');
const twilio = require('twilio');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const { Phone, REGIONS } = require('../models/phone');
const { sendEmailToSelf } = require('../services/email');
const router = express.Router();

const regionKey = {
  EAST_OAKLAND: 'East Oakland',
  WEST_OAKLAND: 'West Oakland',
};

const SIGN_UP_WORD = 'enroll';
const signUpResponse = (region) => {
  return `You have been added to the text list for ${regionKey[region]}.`;
};

const duplicateResponse = (region) => {
  return `Your phone number is already on the list for ${regionKey[region]}`;
};

const FEEDBACK_WORD = 'feedback';
const feedbackResponse = () => {
  return 'Thank you for your feedback. A team member will review your message soon.';
};

const CANCEL_WORD = 'STOP';
const cancelResponse = (region) => {
  return `Your number has been taken off the alert list for ${regionKey[region]}`;
};

const generalInfo = (region) => {
  return `This is the Community Kitchens text service for ${regionKey[region]}. Send the word "${SIGN_UP_WORD}" to sign up for alerts. Send the word ${FEEDBACK_WORD} to give us some feedback.`;
};

router.post(
  '/text/incoming',
  twilio.webhook({ protocol: 'https' }),
  async (req, res) => {
    const response = new MessagingResponse();

    const responseMessage = await routeTextToResponse(req.body);
    response.message(responseMessage);

    res.set('Content-Type', 'text/xml');
    return res.send(response.toString());
  }
);

const routeTextToResponse = async ({ Body, From, To }) => {
  const region = Object.values(REGIONS).find(
    (reg) => reg.phoneNumber === To
  ).name;

  switch (Body.toLowerCase()) {
    case SIGN_UP_WORD:
      return await addPhoneNumber(From, region);
    case FEEDBACK_WORD:
      await sendEmailToSelf({
        subject: 'Feedback Text Received',
        message: `Received from ${From}: ${Body}`,
      });
      return feedbackResponse();
    case CANCEL_WORD:
      return await removePhoneNumber(From, region);
    default:
      return generalInfo(region);
  }
};

const addPhoneNumber = async (number, region) => {
  const existingNumber = await Phone.findOne({ number });
  if (existingNumber) {
    if (existingNumber.region.includes(region)) {
      return duplicateResponse(region);
    } else {
      existingNumber.region.push(region);
      await existingNumber.save();
    }
  } else {
    const newPhone = new Phone({ number, region: [region] });
    await newPhone.save();
  }
  return signUpResponse(region);
};

const removePhoneNumber = async (number, region) => {
  const existingNumber = await Phone.findOne({ number });

  if (existingNumber) {
    existingNumber.region = existingNumber.region.filter((r) => r !== region);
    await existingNumber.save();
  }

  return cancelResponse(region);
};

module.exports = router;
