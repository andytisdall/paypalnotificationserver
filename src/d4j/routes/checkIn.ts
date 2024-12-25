import express from 'express';
import jwt from 'jsonwebtoken';
import { addDays } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import mongoose from 'mongoose';

import { currentD4JUser } from '../../middlewares/current-d4j-user';
import {
  createD4jCheckIn,
  getValidD4jCheckIns,
  updateD4jCheckInsAsSpent,
  updateD4jCheckInAsWinner,
  D4JCheckIn,
} from '../../utils/salesforce/SFQuery/d4j';
import {
  UnformattedContact,
  getContactById,
} from '../../utils/salesforce/SFQuery/contact';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';
import getSecrets from '../../utils/getSecrets';

const CheckIn = mongoose.model('CheckIn');

type CheckInResponse = {
  result: 'SUCCESS' | 'DUPLICATE' | 'UNAUTHORIZED' | 'MALFORMED';
};

const DISALLOWED_CONTACTS = {
  andy: '0038Z000035IIhKQAW',
  maria: '0038Z000035GzLQQA0',
  jill: '0038Z00003UX3YEQA1',
  mollye: '0038Z000035HOHMQA4',
  rick: '0038Z00003Rh3IyQAJ',
  kendall: '0038Z00003Rh1gTQAR',
  christian: '0038Z00003ApeG0QAJ',
  stacey: '003UP00000508SXYAY',
  kenai: '0038Z00003RebUfQAJ',
};

const router = express.Router();

router.post('/rewards/check-in', currentD4JUser, async (req, res) => {
  const { D4J_CHECK_IN_KEY } = await getSecrets(['D4J_CHECK_IN_KEY']);

  const { value }: { value: string } = req.body;

  const { restaurantId, date } = jwt.verify(value, D4J_CHECK_IN_KEY, {
    algorithms: ['HS256'],
  }) as unknown as {
    restaurantId: string;
    date: string;
  };

  if (!req.currentD4JUser) {
    const result: CheckInResponse = {
      result: 'UNAUTHORIZED',
    };
    return res.send(result);
  }

  if (!restaurantId || !date) {
    const result: CheckInResponse = {
      result: 'MALFORMED',
    };
    return res.send(result);
  }

  const midnightToday = utcToZonedTime(new Date(date), 'America/Los_Angeles');

  midnightToday.setHours(0);
  midnightToday.setMinutes(0);
  const lowerBound = zonedTimeToUtc(midnightToday, 'America/Los_Angeles');
  const upperBound = addDays(lowerBound, 1);

  const existingCheckIn = await CheckIn.findOne({
    date: { $gte: lowerBound, $lt: upperBound },
    restaurant: restaurantId,
    user: req.currentD4JUser.id,
  });

  if (existingCheckIn) {
    const result: CheckInResponse = {
      result: 'DUPLICATE',
    };
    return res.send(result);
  }

  const newCheckIn = new CheckIn({
    restaurant: restaurantId,
    user: req.currentD4JUser.id,
    date: new Date(),
  });

  await newCheckIn.save();

  const result: CheckInResponse = {
    result: 'SUCCESS',
  };
  res.send(result);

  if (req.currentD4JUser.salesforceId) {
    const checkInId = await createD4jCheckIn({
      contactId: req.currentD4JUser.salesforceId,
      restaurantId,
    });
    newCheckIn.salesforceId = checkInId;
    await newCheckIn.save();
  }
});

router.get('/rewards/check-in', currentD4JUser, async (req, res) => {
  const user = req.currentD4JUser;

  if (!user) {
    throw Error('User is not signed in');
  }

  const checkIns = await CheckIn.find({ user: user.id }).sort([['date', -1]]);
  res.send(checkIns);
});

router.post(
  '/rewards/prize-drawing',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    // get all check-ins that are valid
    const checkIns = await getValidD4jCheckIns();

    // console.log(checkIns.length);

    const allowedCheckIns = checkIns.filter(
      (checkIn) =>
        !Object.values(DISALLOWED_CONTACTS).includes(checkIn.Contact__c)
    );

    const numberOfCheckIns = allowedCheckIns.length;
    if (!allowedCheckIns || !numberOfCheckIns) {
      throw Error('No valid check-ins found');
    }

    // mark all fetched check-ins as spent & winner
    await updateD4jCheckInsAsSpent(checkIns.map((c) => c.Id));

    const contact1 = await drawWinner(allowedCheckIns);
    const contact2 = await drawWinner(allowedCheckIns);
    const contact3 = await drawWinner(allowedCheckIns);

    // return name of contact
    res.send({
      firstPrize: {
        id: contact1.Id,
        firstName: contact1.FirstName,
        lastName: contact1.LastName,
      },
      secondPrize: {
        id: contact2.Id,
        firstName: contact2.FirstName,
        lastName: contact2.LastName,
      },
      thirdPrize: {
        id: contact3.Id,
        firstName: contact3.FirstName,
        lastName: contact3.LastName,
      },
      numberOfCheckIns,
    });
  }
);

const drawWinner = async (
  checkIns: D4JCheckIn[]
): Promise<UnformattedContact> => {
  // get random number between 0 and list length - 1
  const randomIndex = Math.floor(Math.random() * (checkIns.length - 1));
  // draw d4j check-in at that index
  const winningCheckIn = checkIns.splice(randomIndex, 1)[0];
  const contact = await getContactById(winningCheckIn.Contact__c);
  await updateD4jCheckInAsWinner(winningCheckIn.Id);

  return contact;
};

router.get('/rewards/check-in/all', async (req, res) => {
  const checkIns = await CheckIn.find();
  return res.send({ checkIns: checkIns.length + 1500 });
});

export default router;
