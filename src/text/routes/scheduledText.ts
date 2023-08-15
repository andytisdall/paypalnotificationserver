import express from 'express';
import { format, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

import { getTwilioClient } from './outgoingText';
import getSecrets from '../../utils/getSecrets';
import { OutgoingTextRecord } from '../models/outgoingTextRecord';
import { REGIONS, Region } from '../models/phone';
import { NewOutgoingTextRecord } from './outgoingText';
import { OutgoingText } from './outgoingText';

const router = express.Router();

router.post('/outgoing/salesforce', async (req, res) => {
  const { authorization } = req.headers;
  const { CK_API_KEY, MESSAGING_SERVICE_SID } = await getSecrets([
    'CK_API_KEY',
    'MESSAGING_SERVICE_SID',
  ]);

  if (!CK_API_KEY) {
    throw Error('Could not find CK API Key');
  }
  if (!MESSAGING_SERVICE_SID) {
    throw Error(
      'No Messaging Service ID found, which is required for a scheduled message.'
    );
  }
  if (CK_API_KEY !== authorization) {
    return res.sendStatus(403);
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
  dateTime.setHours(16);
  dateTime.setMinutes(25);
  const zonedTime = zonedTimeToUtc(dateTime, 'America/Los_Angeles');

  const outgoingText: OutgoingText = {
    body: message,
    from: responsePhoneNumber,
    sendAt: zonedTime,
    messagingServiceSid: MESSAGING_SERVICE_SID,
    scheduleType: 'fixed',
  };

  const createOutgoingText = async (phone: string) => {
    await twilioClient.messages.create({ ...outgoingText, to: phone });
  };

  const textPromises = formattedNumbers.map(createOutgoingText);
  await Promise.all(textPromises);

  const newOutgoingTextRecord = new OutgoingTextRecord<NewOutgoingTextRecord>({
    sender: 'salesforce',
    region,
    message,
    date: zonedTime,
  });
  await newOutgoingTextRecord.save();

  res.send({ success: true });
});

export default router;
