import express from 'express';
import twilio from 'twilio';
import moment from 'moment';
import mongoose from 'mongoose';
import { format, zonedTimeToUtc } from 'date-fns-tz';
import { formatISO } from 'date-fns';

import { REGIONS, Region } from '../models/phone';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireTextPermission } from '../../middlewares/require-text-permission';
import { storeFile } from '../../files/storeFile';
import getSecrets from '../../utils/getSecrets';

const Phone = mongoose.model('Phone');
const Feedback = mongoose.model('Feedback');
const OutgoingText = mongoose.model('OutgoingText');

interface NewOutgoingText {
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
  messagingServiceSid?: string;
  scheduleType?: 'fixed';
};

smsRouter.post(
  '/outgoing/scheduled',
  currentUser,
  requireAuth,
  requireTextPermission,
  async (req, res) => {
    const twilioClient = await getTwilioClient();

    const { MESSAGING_SERVICE_SID } = await getSecrets([
      'MESSAGING_SERVICE_SID',
    ]);
    if (!MESSAGING_SERVICE_SID) {
      throw Error(
        'No Messaging Service ID found, which is required for a scheduled message.'
      );
    }

    const {
      message,
      region,
      sendAt,
      photoUrl,
    }: {
      message: string;
      region: Region;
      sendAt: string;
      photoUrl?: string;
    } = req.body;

    if (!message) {
      res.status(422);
      throw new Error('No message to send');
    }

    if (!region) {
      res.status(422);
      throw new Error('No region specified');
    }

    if (!sendAt) {
      res.status(422);
      throw new Error('No time specified');
    }
    console.log(sendAt);

    let formattedNumbers: string[] = [];
    const responsePhoneNumber = REGIONS[region];

    //   const allPhoneNumbers = await Phone.find({ region });
    //   formattedNumbers = allPhoneNumbers.map((p) => p.number);

    // if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    formattedNumbers = ['+14158190251'];
    // }

    const outgoingText: OutgoingText = {
      body: message,
      from: responsePhoneNumber,
      sendAt: new Date(sendAt),
      messagingServiceSid: MESSAGING_SERVICE_SID,
      scheduleType: 'fixed',
    };

    let mediaUrl = photoUrl;

    if (req.files?.photo && !Array.isArray(req.files.photo)) {
      const fileName =
        'scheduled-outgoing-text-' +
        moment(sendAt).format('YYYY-MM-DD-hh-ss-a');

      mediaUrl = await storeFile({
        file: req.files.photo,
        name: fileName,
      });

      outgoingText.mediaUrl = [mediaUrl];
    } else if (photoUrl) {
      outgoingText.mediaUrl = [photoUrl];
    }

    const createOutgoingText = async (phone: string) => {
      await twilioClient.messages.create({ ...outgoingText, to: phone });
    };

    const textPromises = formattedNumbers.map(createOutgoingText);
    await Promise.all(textPromises);

    const newOutgoingTextRecord = new OutgoingText<NewOutgoingText>({
      sender: req.currentUser!.id,
      region,
      message,
      image: mediaUrl,
      date: new Date(sendAt),
    });
    await newOutgoingTextRecord.save();

    res.send({ message, region, photoUrl: mediaUrl });
  }
);

smsRouter.post(
  '/outgoing/mobile',
  currentUser,
  requireAuth,
  async (req, res) => {
    const twilioClient = await getTwilioClient();

    const {
      message,
      region,
    }: {
      message: string;
      region: Region;
      feedbackId?: string;
    } = req.body;

    if (!message) {
      res.status(422);
      throw new Error('No message to send');
    }

    if (!region) {
      res.status(422);
      throw new Error('No region or number specified');
    }

    let formattedNumbers: string[] = [];
    const responsePhoneNumber = REGIONS[region];

    formattedNumbers = ['+14158190251'];

    const outgoingText: OutgoingText = {
      body: message,
      from: responsePhoneNumber,
    };

    let photoUrl;

    if (req.files?.photo && !Array.isArray(req.files.photo)) {
      const fileName = 'outgoing-text-' + moment().format('YYYY-MM-DD-hh-ss-a');

      photoUrl = await storeFile({
        file: req.files.photo,
        name: fileName,
      });

      outgoingText.mediaUrl = [photoUrl];
    }

    const createOutgoingText = async (phone: string) => {
      await twilioClient.messages.create({ ...outgoingText, to: phone });
    };

    const textPromises = formattedNumbers.map(createOutgoingText);
    await Promise.all(textPromises);

    const newOutgoingTextRecord = new OutgoingText<NewOutgoingText>({
      sender: req.currentUser!.id,
      region,
      message,
      image: photoUrl,
    });
    await newOutgoingTextRecord.save();

    res.send({ message, region, photoUrl });
  }
);

smsRouter.post(
  '/outgoing',
  currentUser,
  requireAuth,
  requireTextPermission,
  async (req, res) => {
    const twilioClient = await getTwilioClient();

    const {
      message,
      region,
      feedbackId,
      number,
      photoUrl,
    }: {
      message: string;
      region: Region;
      feedbackId?: string;
      number?: string;
      photoUrl?: string;
    } = req.body;

    if (!message) {
      res.status(422);
      throw new Error('No message to send');
    }

    if (!region && !number) {
      res.status(422);
      throw new Error('No region or number specified');
    }

    let formattedNumbers: string[] = [];
    const responsePhoneNumber = REGIONS[region];

    if (region) {
      const allPhoneNumbers = await Phone.find({ region });
      formattedNumbers = allPhoneNumbers.map((p) => p.number);
    } else if (number) {
      const phoneNumber = number.replace(/[^\d]/g, '');
      console.log(phoneNumber);
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
    };

    let mediaUrl = photoUrl;

    if (req.files?.photo && !Array.isArray(req.files.photo)) {
      const fileName = 'outgoing-text-' + moment().format('YYYY-MM-DD-hh-ss-a');

      mediaUrl = await storeFile({
        file: req.files.photo,
        name: fileName,
      });

      outgoingText.mediaUrl = [mediaUrl];
    } else if (photoUrl) {
      outgoingText.mediaUrl = [photoUrl];
    }

    const createOutgoingText = async (phone: string) => {
      await twilioClient.messages.create({ ...outgoingText, to: phone });
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

    const newOutgoingTextRecord = new OutgoingText<NewOutgoingText>({
      sender: req.currentUser!.id,
      region: region || number,
      message,
      image: mediaUrl,
    });
    await newOutgoingTextRecord.save();

    res.send({ message, region, photoUrl: mediaUrl });
  }
);

export const getTwilioClient = async () => {
  const { TWILIO_ID, TWILIO_AUTH_TOKEN } = await getSecrets([
    'TWILIO_ID',
    'TWILIO_AUTH_TOKEN',
  ]);
  if (!TWILIO_ID || !TWILIO_AUTH_TOKEN) {
    throw Error('Could not find twilio credentials');
  }
  return new twilio.Twilio(TWILIO_ID, TWILIO_AUTH_TOKEN);
};

export default smsRouter;
