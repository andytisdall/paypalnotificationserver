const express = require('express');
const twilio = require('twilio');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const { Phone, REGIONS } = require('../models/phone');
const { Feedback } = require('../models/feedback');
const textResponses = require('../services/textResponses');

const router = express.Router();

router.post(
  '/text/incoming',
  twilio.webhook({ protocol: 'https' }),
  async (req, res) => {
    console.log('Incoming Text: ' + req.body);
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

// send general info if you're not on the list
// feedback if you are on the list

const routeTextToResponse = async ({ Body, From, To }) => {
  const region = Object.keys(REGIONS).find((reg) => REGIONS[reg] === To);

  const keyword = Body.toLowerCase().replace(' ', '');

  const existingNumber = await Phone.findOne({ number: From });

  // sign up words - check for duplicate, and add region to existing users region or create new phone number

  if (textResponses.SIGN_UP_WORDS.includes(keyword)) {
    if (existingNumber && existingNumber.region.includes(region)) {
      return textResponses.duplicateResponse(region);
    }
    return await addPhoneNumber(existingNumber, From, region);
  }

  // built in unsubscribe words for twilio. outgoing messages will be blocked until 'START' is texted

  if (textResponses.CANCEL_WORDS.includes(keyword)) {
    if (existingNumber) {
      await removePhoneNumber(existingNumber, region);
    }
    return null;
  }

  // if we receive a message from someone not signed up, give general info

  if (
    !existingNumber?.region.includes(region) ||
    textResponses.INFO_WORD === keyword
  ) {
    return textResponses.generalInfoResponse(region);
  }

  // if it's an existing user with text that has not been matched, it's treated as feedback

  return await receiveFeedback(Body, From, region);
};

const addPhoneNumber = async (user, number, region) => {
  if (user) {
    user.region.push(region);
    await user.save();
  } else {
    const newPhone = new Phone({ number, region: [region] });
    await newPhone.save();
  }
  return textResponses.signUpResponse(region);
};

const removePhoneNumber = async (user, region) => {
  user.region = user.region.filter((r) => r !== region);
  await user.save();
};

const receiveFeedback = async (message, sender, region) => {
  const newFeedback = new Feedback({ message, sender, region });
  await newFeedback.save();
  return textResponses.feedbackResponse();
};

module.exports = router;
