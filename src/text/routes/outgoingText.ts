import express from 'express';
import twilio from 'twilio';
import moment from 'moment';
import mongoose from 'mongoose';

import { REGIONS, Region } from '../models/phone';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireTextPermission } from '../../middlewares/require-text-permission';
import { storeFile } from '../../files/storeFile';
import getSecrets from '../../utils/getSecrets';
import urls from '../../utils/urls';

const Phone = mongoose.model('Phone');
const Feedback = mongoose.model('Feedback');

const smsRouter = express.Router();

export type OutgoingText = { from: string; body: string; mediaUrl?: string[] };

smsRouter.post('/outgoing/mobile', async (req, res) => {
  const twilioClient = await getTwilioClient();

  const {
    message,
    region,
    feedbackId,
    number,
    photo,
  }: {
    message: string;
    region: Region;
    feedbackId?: string;
    number?: string;
    photo?: string;
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

  // if (region) {
  //   const allPhoneNumbers = await Phone.find({ region });
  //   formattedNumbers = allPhoneNumbers.map((p) => p.number);
  // } else if (number) {
  //   const phoneNumber = number.replace(/[^\d]/g, '');
  //   console.log(phoneNumber);
  //   if (phoneNumber.length !== 10) {
  //     res.status(422);
  //     throw new Error('Phone number must have 10 digits');
  //   }

  //   formattedNumbers = ['+1' + phoneNumber];
  // }

  // if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  formattedNumbers = ['+14158190251'];
  // }

  // console.log(formattedNumbers);

  const outgoingText: OutgoingText = {
    body: message,
    from: responsePhoneNumber,
  };

  if (req.files?.photo && !Array.isArray(req.files.photo)) {
    const fileName = 'outgoing-text-' + moment().format('YYYY-MM-DD-hh-ss-a');

    const imageId = await storeFile({
      file: req.files.photo,
      name: fileName,
    });

    outgoingText.mediaUrl = [urls.client + '/api/files/images/' + imageId];
  } else if (photo) {
    outgoingText.mediaUrl = [photo];
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
    }
    await feedback.save();
  }

  res.send({ message, region, photoUrl: outgoingText.mediaUrl });
});

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
      photo,
    }: {
      message: string;
      region: Region;
      feedbackId?: string;
      number?: string;
      photo?: string;
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

    console.log(formattedNumbers);

    const outgoingText: OutgoingText = {
      body: message,
      from: responsePhoneNumber,
    };

    if (req.files?.photo && !Array.isArray(req.files.photo)) {
      const fileName = 'outgoing-text-' + moment().format('YYYY-MM-DD-hh-ss-a');

      const imageId = await storeFile({
        file: req.files.photo,
        name: fileName,
      });

      outgoingText.mediaUrl = [urls.client + '/api/files/images/' + imageId];
    } else if (photo) {
      outgoingText.mediaUrl = [photo];
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
      }
      await feedback.save();
    }

    res.send({ message, region, photoUrl: outgoingText.mediaUrl });
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
