import express from 'express';
import twilio from 'twilio';
import moment from 'moment';
import mongoose from 'mongoose';

import { REGIONS, Region } from '../models/phone';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import urls from '../../utils/urls';
import { storeFile } from '../../files/google/storeFileGoogle';
import getSecrets from '../../utils/getSecrets';
import { removeTextSubscriber } from '../../utils/salesforce/SFQuery/text';

const Phone = mongoose.model('Phone');
const Feedback = mongoose.model('Feedback');
const OutgoingTextRecord = mongoose.model('OutgoingTextRecord');

export interface NewOutgoingTextRecord {
  message: string;
  sender: string;
  region: string;
  image?: string;
  date?: Date;
}

const smsRouter = express.Router();

export type OutgoingText = {
  from: string;
  body: string;
  mediaUrl?: string[];
  sendAt?: Date;
  messagingServiceSid: string;
  scheduleType?: 'fixed';
};

smsRouter.post('/outgoing', currentUser, requireAuth, async (req, res) => {
  const twilioClient = await getTwilioClient();

  const {
    message,
    region,
    feedbackId,
    number,
    photo,
    storedText,
  }: {
    message: string;
    region: Region | 'both';
    feedbackId?: string;
    number?: string;
    photo?: string;
    storedText?: string;
  } = req.body;

  const { MESSAGING_SERVICE_SID } = await getSecrets(['MESSAGING_SERVICE_SID']);

  if (!MESSAGING_SERVICE_SID) {
    throw Error('Could not find messaging service ID');
  }

  if (!message) {
    res.status(422);
    throw new Error('No message to send');
  }

  if (!region && !number) {
    res.status(422);
    throw new Error('No region or number specified');
  }

  if (req.currentUser!.id === urls.appleReviewerId) {
    throw Error('You are not authorized to send text alerts');
  }

  let formattedNumbers: string[] = [];
  const responsePhoneNumber =
    region === 'both' || number ? REGIONS.WEST_OAKLAND : REGIONS[region];

  if (region && !number) {
    const allPhoneNumbers =
      region === 'both' ? await Phone.find() : await Phone.find({ region });
    formattedNumbers = allPhoneNumbers.map((p) => p.number);
  } else if (number) {
    const phoneNumber = number.replace(/[^\d]/g, '');
    if (phoneNumber.length !== 10) {
      res.status(422);
      throw new Error('Phone number must have 10 digits');
    }

    formattedNumbers = ['+1' + phoneNumber];
  }

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    formattedNumbers = ['+14158190251'];
  }

  const outgoingText: OutgoingText = {
    body: message,
    from: responsePhoneNumber,
    messagingServiceSid: MESSAGING_SERVICE_SID,
  };

  let mediaUrl = photo;

  if (req.files?.photo && !Array.isArray(req.files.photo)) {
    const fileName = 'outgoing-text-' + moment().format('YYYY-MM-DD-hh-ss-a');

    mediaUrl = await storeFile({
      file: req.files.photo,
      name: fileName,
    });

    outgoingText.mediaUrl = [mediaUrl];
  } else if (photo) {
    outgoingText.mediaUrl = [photo];
  }

  const createOutgoingText = async (phone: string) => {
    return await twilioClient.messages.create({ ...outgoingText, to: phone });
  };

  const textPromises = formattedNumbers.map(createOutgoingText);
  await Promise.all(textPromises);

  if (feedbackId) {
    const feedback = await Feedback.findById(feedbackId);
    if (feedback) {
      const response = { message, date: moment().format() };
      if (feedback.response) {
        feedback.response.push(response);
      } else {
        feedback.response = [response];
      }
      await feedback.save();
    }
  }

  const newOutgoingTextRecord = new OutgoingTextRecord<NewOutgoingTextRecord>({
    sender: req.currentUser!.id,
    region: number || region,
    message,
    image: mediaUrl,
  });
  await newOutgoingTextRecord.save();

  res.send({ message, region, photoUrl: mediaUrl, number, storedText });
});

smsRouter.post(
  '/outgoing/mobile',
  async (req, res, next) => {
    req.url = '/outgoing';
    next();
  },
  smsRouter
);

export const getTwilioClient = async () => {
  const { TWILIO_ID, TWILIO_AUTH_TOKEN } = await getSecrets([
    'TWILIO_ID',
    'TWILIO_AUTH_TOKEN',
  ]);
  if (!TWILIO_ID || !TWILIO_AUTH_TOKEN) {
    throw Error('Could not find twilio credentials');
  }
  return new twilio.Twilio(TWILIO_ID, TWILIO_AUTH_TOKEN, { autoRetry: true });
};

export default smsRouter;
