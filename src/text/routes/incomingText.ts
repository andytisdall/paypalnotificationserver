import express from 'express';
import mongoose from 'mongoose';
import twilio, { twiml } from 'twilio';
import moment from 'moment';

import { REGIONS, Region, DROPOFF_NUMBER } from '../models/phone';
import textResponses from '../textResponses';
import { sendEmail } from '../../utils/email';
import urls from '../../utils/urls';
import { OutgoingText, getTwilioClient } from './outgoingText';
import {
  addTextSubscriber,
  editTextSubscriber,
} from '../../utils/salesforce/SFQuery/text';

const Feedback = mongoose.model('Feedback');
const Phone = mongoose.model('Phone');
const MessagingResponse = twiml.MessagingResponse;
const router = express.Router();

const DROPOFF_EMAIL_SUBSCRIBERS = [
  'andy@ckoakland.org',
  'mollye@ckoakland.org',
  'alea@ckoakland.org',
];

const DROPOFF_PHONE_SUBSCRIBERS = [
  '+14158190251',
  '+14157557053',
  '+17185017050',
];

export type PhoneNumber =
  | (mongoose.Document<
      unknown,
      any,
      {
        number: string;
        region: string[];
      }
    > & {
      number: string;
      region: string[];
    } & {
      _id: mongoose.Types.ObjectId;
    })
  | null;

router.post(
  '/incoming',
  twilio.webhook({ protocol: 'https' }),
  async (req, res) => {
    const response = new MessagingResponse();

    const images = getImages(req.body);

    const responseMessage = await routeTextToResponse(req.body, images);
    if (!responseMessage) {
      return res.sendStatus(200);
    }

    response.message(responseMessage);

    res.set('Content-Type', 'text/xml');
    return res.send(response.toString());
  }
);

router.post(
  '/incoming/dropoff',
  twilio.webhook({ protocol: 'https' }),
  async (req, res) => {
    const { Body, From, DateSent } = req.body;

    const images = getImages(req.body);

    const textUrl = urls.client + '/text/send-text';

    const formattedDate = moment(DateSent)
      .subtract(7, 'hours')
      .format('MM/DD/YY hh:mm a');

    let html = `
    <h4>This is a CK Home Chef drop off alert</h4>
    <p>From: ${From.slice(2)}</p>
    <p>${formattedDate}</p>
    <p>${Body}</p>
    `;

    if (images.length) {
      let imagesHtml = `<p>Images included with message:</p>`;
      images.forEach((url) => {
        imagesHtml += `<p>Copy the URL for this image: ${url}</p><a href='${url}' download='${formattedDate}'><img src='${url}' width='300px' height='auto'/></a>`;
      });
      html += imagesHtml;
    }

    html += `<p>Go to the <a href='${textUrl}'>CK Text Service Portal</a> to send out a text to the subscriber list.</p>`;

    const msg = {
      to: DROPOFF_EMAIL_SUBSCRIBERS,
      from: 'andy@ckoakland.org',
      subject: 'You got a text on the Home Chef drop-off line',
      mediaUrl: images,
      html,
    };

    await sendEmail(msg);

    const twilioClient = await getTwilioClient();
    const alertText: OutgoingText = {
      from: DROPOFF_NUMBER,
      body: Body,
      mediaUrl: images,
    };
    const textPromises = DROPOFF_PHONE_SUBSCRIBERS.map((number) => {
      return twilioClient.messages.create({
        ...alertText,
        to: number,
      });
    });
    await Promise.all(textPromises);

    const response = new MessagingResponse();
    response.message(textResponses.dropOffResponse);

    res.set('Content-Type', 'text/xml');
    res.send(response.toString());
  }
);

const getImages = (body: any) => {
  const images: string[] = [];
  for (let i = 0; i < body.NumMedia; i++) {
    images.push(body[`MediaUrl${i}`]);
  }
  return images;
};

// send general info if you're not on the list
// feedback if you are on the list

interface IncomingText {
  Body: string;
  From: string;
  To: string;
}

const routeTextToResponse = async (
  { Body, From, To }: IncomingText,
  images: string[]
) => {
  const regions = Object.keys(REGIONS) as Region[];
  const region = regions.find((reg) => REGIONS[reg] === To);
  if (!region) {
    throw Error('could not map recipient number to a region');
  }

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
    await removePhoneNumber(existingNumber, region);

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

  return await receiveFeedback({ message: Body, sender: From, region, images });
};

const addPhoneNumber = async (
  user: PhoneNumber,
  number: string,
  region: Region
) => {
  if (user) {
    user.region.push(region);
    await user.save();
    await editTextSubscriber(user.number, user.region);
  } else {
    const newPhone = new Phone({ number, region: [region] });
    await newPhone.save();
    await addTextSubscriber(newPhone.number, newPhone.region);
  }
  return textResponses.signUpResponse(region, number);
};

const removePhoneNumber = async (user: PhoneNumber, region: Region) => {
  if (!user) {
    return;
  }
  user.region = user.region.filter((r) => r !== region);
  await editTextSubscriber(user.number, user.region);
  await user.save();
};

interface Feedback {
  message: string;
  sender: string;
  region: Region;
  images: string[];
}

const receiveFeedback = async (feedbackArgs: Feedback) => {
  const newFeedback = new Feedback(feedbackArgs);
  await newFeedback.save();
  await sendFBNotification(feedbackArgs);
  return textResponses.feedbackResponse(feedbackArgs.sender);
};

const sendFBNotification = async (feedbackArgs: Feedback) => {
  const html = `
  <p>You received feedback through the CK Text Service:</p>
  <p><b>Message:</b> ${feedbackArgs.message}</p>
  <p><b>From:</b> ${feedbackArgs.sender}</p>
  <p><b>Region:</b> ${feedbackArgs.region}</p>
  `;

  const RECIPIENT = 'mollye@ckoakland.org';
  const SUBJECT = 'CK Text Service: You received feedback';
  await sendEmail({
    to: RECIPIENT,
    from: RECIPIENT,
    subject: SUBJECT,
    html,
    mediaUrl: feedbackArgs.images,
  });
};

export default router;
