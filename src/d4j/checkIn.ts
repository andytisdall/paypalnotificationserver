import express from 'express';
import jwt from 'jsonwebtoken';
import { format } from 'date-fns';
import mongoose from 'mongoose';

import { currentD4JUser } from '../middlewares/current-d4j-user';

const CheckIn = mongoose.model('CheckIn');

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
    throw Error('User is not signed in');
  }

  if (!restaurantId || !date) {
    res.sendStatus(403);
  }

  const existingCheckIn = await CheckIn.findOne({
    date: new Date(date),
    restaurant: restaurantId,
    user: req.currentD4JUser.id,
  });

  if (existingCheckIn) {
    // if (format(new Date(date), 'MM/dd/yy') === format(new Date(), 'MM/dd/yy')) {
    throw Error('Already checked in today');
  }

  const newCheckIn = new CheckIn({
    contact: req.currentD4JUser.id,
    restaurant: restaurantId,
    user: req.currentD4JUser.id,
  });

  await newCheckIn.save();
  console.log('chizzek');
  res.sendStatus(204);
});

router.get('/rewards/check-in', currentD4JUser, async (req, res) => {
  console.log('hit');
  const user = req.currentD4JUser;

  if (!user) {
    throw Error('User is not signed in');
  }

  const checkIns = await CheckIn.find({ user: user.id });
  res.send(checkIns);
});

export default router;
