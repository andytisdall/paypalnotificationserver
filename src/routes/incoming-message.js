const express = require('express');
const twilio = require('twilio');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const { Phone, REGIONS } = require('../models/phone');
const { sendEmailToSelf } = require('../services/email');
const router = express.Router();

const SIGN_UP_WORD = 'enroll';
const SIGN_UP_RESPONSE = 'You have been added to the text list!';
const DUPLICATE_RESPONSE = 'Your phone number is already on our list!';
const FEEDBACK_RESPONSE =
  'Thank you for your feedback. A team member will review your message soon.';

router.post(
  '/incoming-sms',
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

    if (Body && Body.toLowerCase() === SIGN_UP_WORD) {
      const region = Object.values(REGIONS).find(
        (reg) => reg.phoneNumber === To
      );
      const responseMessage = await addPhoneNumber(From, region);
      response.message(responseMessage);
      res.set('Content-Type', 'text/xml');
      return res.send(response.toString());
    }
  }
);

const addPhoneNumber = async (number, region) => {
  const existingNumber = await Phone.findOne({ number });
  if (existingNumber) {
    return DUPLICATE_RESPONSE;
  }
  const newPhone = new Phone({ number, region });
  await newPhone.save();
  return SIGN_UP_RESPONSE;
};

router.post(
  '/feedback',
  twilio.webhook({ protocol: 'https' }),
  async (req, res) => {
    const { Body, From } = req.body;
    const response = new MessagingResponse();
    await sendEmailToSelf({
      subject: 'Feedback Text Received',
      message: `Received from ${From}: ${Body.body}`,
    });

    response.message(FEEDBACK_RESPONSE);

    res.set('Content-Type', 'text/xml');
    return res.send(response.toString());
  }
);

module.exports = router;
