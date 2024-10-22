import express from 'express';
import mongoose from 'mongoose';

import { currentUser } from '../../../middlewares/current-user';
import { requireAuth } from '../../../middlewares/require-auth';

const User = mongoose.model('User');
const router = express.Router();

router.post('/save-token', currentUser, requireAuth, async (req, res) => {
  const { token }: { token: string } = req.body;

  const user = await User.findById(req.currentUser!.id);

  user.homeChefNotificationToken = token;

  await user.save();
  res.sendStatus(204);
});

export default router;
