import express from 'express';
import twilio from 'twilio';
import moment from 'moment';
import mongoose from 'mongoose';

import { REGIONS, Region } from '../models/phone';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';
import { storeFile } from '../../files/storeFile';
import getSecrets from '../../utils/getSecrets';
import urls from '../../utils/urls';

const Phone = mongoose.model('Phone');
const smsRouter = express.Router();

export type OutgoingText = { from: string; body: string; mediaUrl?: string[] };

smsRouter.post(
  '/outgoing',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const twilioClient = await getTwilioClient();

    const { message, region }: { message: string; region: Region | string } =
      req.body;

    if (!message) {
      res.status(422);
      throw new Error('No message to send');
    }

    if (!region) {
      res.status(422);
      throw new Error('No region specified');
    }

    let formattedNumbers: string[] = [];
    let responsePhoneNumber: string | undefined;

    if (region === 'WEST_OAKLAND' || region === 'EAST_OAKLAND') {
      responsePhoneNumber = REGIONS[region];
      const allPhoneNumbers = await Phone.find({ region });
      formattedNumbers = allPhoneNumbers.map((p) => p.number);
    } else {
      const phoneNumber = region.replace(/[^\d]/g, '');

      if (phoneNumber.length !== 10) {
        res.status(422);
        throw new Error('Phone number must have 10 digits');
      }

      responsePhoneNumber = REGIONS['EAST_OAKLAND'];
      formattedNumbers = ['+1' + phoneNumber];
    }

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
    }

    const createOutgoingText = async (phone: string) => {
      await twilioClient.messages.create({ ...outgoingText, to: phone });
    };

    const textPromises = formattedNumbers.map(createOutgoingText);
    await Promise.all(textPromises);

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
