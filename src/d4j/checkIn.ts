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
    date: Date;
  };

  if (!restaurantId || !date) {
    res.sendStatus(403);
  }

  if (format(date, 'MM/dd/yy') === format(new Date(), 'MM/dd/yy')) {
    throw Error('Already checked in today');
  }
  if (!req.currentD4JUser) {
    throw Error('User is not signed in');
  }

  const newCheckIn = new CheckIn({
    contact: req.currentD4JUser.id,
    restaurant: restaurantId,
  });

  await newCheckIn.save();

  res.sendStatus(204);
});

export default router;
