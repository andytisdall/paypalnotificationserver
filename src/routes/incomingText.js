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

const SIGN_UP_WORDS = ['signup', 'enroll', 'start', 'unstop', 'yes'];
const signUpResponse = (region) => {
  return `You have been added to the text list for ${regionKey[region]}.`;
};

const duplicateResponse = (region) => {
  return `Your phone number is already on the list for ${regionKey[region]}`;
};

const SURVEY_URL = 'example url';
const feedbackResponse = () => {
  return `Thank you for your feedback. A team member will review your message soon. If you want to fill out a survey about your experience with Community Kitchens, please follow this link: ${SURVEY_URL}`;
};

const CANCEL_WORDS = [
  'stop',
  'stopall',
  'unsubscribe',
  'quit',
  'cancel',
  'end',
];

const INFO_WORD = 'info';
const generalInfo = (region) => {
  return `This is the Community Kitchens text service for ${regionKey[region]}. Send the word "${SIGN_UP_WORDS[0]}" to sign up for alerts. Send the word "${CANCEL_WORDS[0]}" to stop receiving texts from this number.`;
};

router.post(
  '/text/incoming',
  twilio.webhook({ protocol: 'https' }),
  async (req, res) => {
    const response = new MessagingResponse();

    const responseMessage = await routeTextToResponse(req.body);
    if (!responseMessage) {
      return;
    }

    response.message(responseMessage);

    res.set('Content-Type', 'text/xml');
    return res.send(response.toString());
  }
);

const routeTextToResponse = async ({ Body, From, To }) => {
  const region = Object.values(REGIONS).find(
    (reg) => reg.phoneNumber === To
  ).name;

  const keyword = Body.toLowerCase().replace(' ', '');

  if (SIGN_UP_WORDS.includes(keyword)) {
    return await addPhoneNumber(From, region);
  }

  if (CANCEL_WORDS.includes(keyword)) {
    await removePhoneNumber(From, region);
    return null;
  }

  if (INFO_WORD === keyword) {
    return generalInfo(region);
  }

  await sendEmailToSelf({
    subject: 'Feedback Text Received',
    message: `Received from ${From}: ${Body}`,
  });
  return feedbackResponse();
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
};

module.exports = router;
