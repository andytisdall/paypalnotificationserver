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
    const notificationsService = await createNotificationsService('homechef');
    const users = await User.find({
      homeChefNotificationToken: { $ne: undefined },
    });
    // const users = await User.find().or([
    //   { username: 'Testo' },
    //   // { username: 'Mollye' },
    // ]);
    const userTokens = users.map((u) => u.homeChefNotificationToken);

    const payload = { title, body: message };

    // const userTokens = [
    //   '47b31d349fc99621bd19367321bb3f50f6bcc7f0860e41f6512d8ae239750494',
    // ];

    await notificationsService.send(userTokens, payload);
    const newNotification = new Notification({
      payload,
      app: 'homechef',
    });
    await newNotification.save();

    res.sendStatus(204);
  }
);

router.get('/notifications', currentUser, requireAuth, async (req, res) => {
  const notifications = await Notification.find({ app: 'homechef' }).sort([
    ['date', -1],
  ]);
  res.send(notifications);
});

export default router;
