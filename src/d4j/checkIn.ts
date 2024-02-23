import express from 'express';
import jwt from 'jsonwebtoken';
import { format } from 'date-fns';
import mongoose from 'mongoose';

import { currentD4JUser } from '../middlewares/current-d4j-user';

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

  const existingCheckIn = await CheckIn.findOne({
    date: new Date(date),
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
