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
    const notificationsService = await createNotificationsService();
    const users = await User.find({
      homeChefNotificationToken: { $ne: undefined },
    });
    const userTokens = users.map((u) => u.homeChefNotificationToken);

    const payload = { title: 'Testing notification', body: 'Is it working?' };

    await notificationsService.send(userTokens, payload);
    const newNotification = new Notification({
      message: payload.body,
      app: 'homechef',
    });
    await newNotification.save();

    res.sendStatus(204);
  }
);

export default router;
