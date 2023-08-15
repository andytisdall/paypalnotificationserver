import express from 'express';
import mongoose from 'mongoose';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';
import createNotificationsService from '../../utils/pushNotifications';

const Notification = mongoose.model('Notification');
const User = mongoose.model('User');

const router = express.Router();

router.post(
  '/notifications',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { title, message }: { title: string; message: string } = req.body;
    const notificationsService = await createNotificationsService();
    const users = await User.find({
      homeChefNotificationToken: { $ne: undefined },
    });
    const userTokens = users.map((u) => u.homeChefNotificationToken);

    const payload = { title, body: message };

    await notificationsService.send(userTokens, payload);
    const newNotification = new Notification({
      payload,
      app: 'homechef',
    });
    await newNotification.save();

    res.sendStatus(204);
  }
);

export default router;
