import express from 'express';
import { zonedTimeToUtc } from 'date-fns-tz';

import { getTwilioClient } from './outgoingText';
import getSecrets from '../../utils/getSecrets';
import { REGIONS, Region } from '../models/phone';
import { OutgoingText } from './outgoingText';
import { requireSalesforceAuth } from '../../middlewares/require-salesforce-auth';
import mongoose from 'mongoose';

const ScheduledText = mongoose.model('ScheduledText');

interface NewScheduledTextRecord {
  message: string;
  scheduledDate: Date;
  region: string;
  twilioIds: string[];
}

const router = express.Router();

router.post('/outgoing/salesforce', requireSalesforceAuth, async (req, res) => {
  const { MESSAGING_SERVICE_SID } = await getSecrets(['MESSAGING_SERVICE_SID']);

  if (!MESSAGING_SERVICE_SID) {
    throw Error(
      'No Messaging Service ID found, which is required for a scheduled message.'
    );
  }

  const {
    message,
    region,
    sendAt,
  }: {
    message: string;
    region: Region;
    sendAt: string;
  } = req.body;

  const twilioClient = await getTwilioClient();

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

  let formattedNumbers: string[] = [];
  const responsePhoneNumber = REGIONS[region];

  //   const allPhoneNumbers = await Phone.find({ region });
  //   formattedNumbers = allPhoneNumbers.map((p) => p.number);

  // if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  formattedNumbers = ['+14158190251'];
  // }

  const dateTime = new Date(sendAt);
  dateTime.setHours(2);
  dateTime.setMinutes(0);
  const zonedTime = zonedTimeToUtc(dateTime, 'America/Los_Angeles');

  const outgoingText: OutgoingText = {
    body: message,
    from: responsePhoneNumber,
    sendAt: zonedTime,
    messagingServiceSid: MESSAGING_SERVICE_SID,
    scheduleType: 'fixed',
  };

  const createOutgoingText = async (phone: string) => {
    const { sid } = await twilioClient.messages.create({
      ...outgoingText,
      to: phone,
    });
    return sid;
  };

  const textPromises = formattedNumbers.map(createOutgoingText);
  const results = await Promise.all(textPromises);

  const newScheduledTextRecord = new ScheduledText<NewScheduledTextRecord>({
    region,
    message,
    scheduledDate: zonedTime,
    twilioIds: results,
  });
  await newScheduledTextRecord.save();

  res.send({ success: true, id: newScheduledTextRecord.id });
});

router.delete('/scheduled/:id', requireSalesforceAuth, async (req, res) => {
  const { id } = req.params;
  const twilioClient = await getTwilioClient();

  const scheduledText = await ScheduledText.findById(id);

  if (!scheduledText) {
    throw Error('Scheduled text not found');
  }

  const promises = scheduledText.twilioIds.map((sid: string) => {
    twilioClient.messages(sid).update({ status: 'canceled' });
  });

  await Promise.all(promises);

  scheduledText.canceled = true;
  await scheduledText.save();

  res.sendStatus(204);
});

router.get(
  '/scheduled',

  async (req, res) => {
    const twilioClient = await getTwilioClient();
    const options = {
      limit: 100,
    };
    const messages = await twilioClient.messages.list(options);
    res.send(messages.filter((txt) => txt.status === 'scheduled'));
  }
);

export default router;
