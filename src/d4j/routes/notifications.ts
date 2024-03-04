import express from 'express';
import mongoose from 'mongoose';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';
import createNotificationsService from '../../utils/pushNotifications';
import { D4JUser } from '../models/d4jUser';

const Notification = mongoose.model('Notification');

const router = express.Router();

router.post(
  '/notifications',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { title, message }: { title: string; message: string } = req.body;
    const notificationsService = await createNotificationsService('d4j');

    const userTokens = (await D4JUser.find())
      .filter((user) => user.token)
      .map(({ token }) => token) as string[];

    const payload = { title, body: message };

    await notificationsService.send(userTokens, payload);
    const newNotification = new Notification({
      payload,
      app: 'd4j',
    });
    await newNotification.save();

    res.sendStatus(204);
  }
);

export default router;
