import express from 'express';
import mongoose from 'mongoose';

import { currentUser } from '../../../middlewares/current-user';
import { requireAuth } from '../../../middlewares/require-auth';
import { requireAdmin } from '../../../middlewares/require-admin';

const User = mongoose.model('User');
const router = express.Router();

router.post('/', currentUser, requireAuth, requireAdmin, async (req, res) => {
  const { username, password, salesforceId } = req.body;

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw Error('Username is in use');
  }

  const newUser = new User({ username, password, salesforceId });
  await newUser.save();
  res.status(201).send(newUser);
});

export default router;
