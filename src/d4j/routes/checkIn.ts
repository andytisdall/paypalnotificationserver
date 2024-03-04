import express from 'express';
import jwt from 'jsonwebtoken';
import { addDays, subDays } from 'date-fns';
import mongoose from 'mongoose';

import { currentD4JUser } from '../../middlewares/current-d4j-user';
import { createD4jVisit } from '../../utils/salesforce/SFQuery/d4j';

const CheckIn = mongoose.model('CheckIn');

type CheckInResponse = {
  result: 'SUCCESS' | 'DUPLICATE' | 'UNAUTHORIZED' | 'MALFORMED';
};

const router = express.Router();

router.post('/rewards/check-in', currentD4JUser, async (req, res) => {
  const SECRET_KEY = 'itisasecret';

  const { value }: { value: string } = req.body;

  const { restaurantId, date } = jwt.verify(value, SECRET_KEY, {
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

  const todaysDate = new Date(date);
  todaysDate.setHours(0);
  todaysDate.setMinutes(0);

  const existingCheckIn = await CheckIn.findOne({
    date: { $gt: subDays(todaysDate, 1), $lt: addDays(todaysDate, 1) },
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
  });

  await newCheckIn.save();

  const result: CheckInResponse = {
    result: 'SUCCESS',
  };
  res.send(result);

  if (req.currentD4JUser.salesforceId) {
    createD4jVisit({
      contactId: req.currentD4JUser.salesforceId,
      restaurantId,
      date,
    });
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

export default router;
