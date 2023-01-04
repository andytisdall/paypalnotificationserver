const express = require('express');
const twilio = require('twilio');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const { Phone, REGIONS } = require('../models/phone');
const { sendEmailToSelf } = require('../services/email');
const router = express.Router();

const regionKey = { EAST_OAKLAND: 'East Oakland', WEST_OAKLAND: 'West Oakland'}

const SIGN_UP_WORD = 'enroll';
const signUpResponse = (region) => {
    return `You have been added to the text list for ${regionKey[region]}.`
}

const DUPLICATE_RESPONSE = 'Your phone number is already on our list!';

const FEEDBACK_WORD = 'feedback';
const FEEDBACK_RESPONSE =
  'Thank you for your feedback. A team member will review your message soon.';

const generalInfo = (region) => {
    return `This is the Community Kitchens text service for ${regionKey[region]}. Send the word "${SIGN_UP_WORD}" to sign up for alerts. Send the word ${FEEDBACK_WORD} to give us some feedback.`
}

router.post(
  '/text/incoming',
  twilio.webhook({ protocol: 'https' }),
  async (req, res) => {
      
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
    // ReferralNumMedia: '0',
    // MessageSid: 'SMc34361cba5c8feeb5e29d309bc9932a3',
    // AccountSid: 'AC575b987418ed71997c08f3c98c861103',
    // From: '+14158190251',
    // ApiVersion: '2010-04-01'

    const { Body, From, To } = req.body;
    const response = new MessagingResponse();
    const region = Object.values(REGIONS).find(
        (reg) => reg.phoneNumber === To
      ).name;

    if (!Body) {
      return;
    }

    if (Body.toLowerCase() === SIGN_UP_WORD) {
      const responseMessage = await addPhoneNumber(From, region);
      response.message(responseMessage);
    }

    if (Body.toLowerCase() === FEEDBACK_WORD) {
      await sendEmailToSelf({
        subject: 'Feedback Text Received',
        message: `Received from ${From}: ${Body}`,
      });

      response.message(FEEDBACK_RESPONSE);
    }

    if (![FEEDBACK_WORD, SIGN_UP_WORD].includes(Body.toLowerCase())) {
        response.message(generalInfo(region))
    }

    res.set('Content-Type', 'text/xml');
    return res.send(response.toString());
  }
);

const addPhoneNumber = async (number, region) => {
  const existingNumber = await Phone.findOne({ number });
  if (existingNumber) {
    if (existingNumber.region === region) {
        return DUPLICATE_RESPONSE;
    } else {
        existingNumber.region === 'BOTH';
        await existingNumber.save();
    }
  } else {
    const newPhone = new Phone({ number, region });
    await newPhone.save();
  }
  return signUpResponse(region);
};

module.exports = router;
