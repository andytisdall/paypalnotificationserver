import express from 'express';
import mongoose from 'mongoose';

import { currentUser } from '../middlewares/current-user';
import { requireAuth } from '../middlewares/require-auth';
import { requireAdmin } from '../middlewares/require-admin';
import createNotificationsService from '../utils/pushNotifications';

const D4jPushToken = mongoose.model('D4jPushToken');
const Notification = mongoose.model('Notification');

const router = express.Router();

router.post('/register-device', async (req, res) => {
  const { token }: { token: string } = req.body;
  const existingToken = await D4jPushToken.findOne({ token });
  if (!existingToken) {
    const newD4jPushToken = new D4jPushToken({ token });
    await newD4jPushToken.save();
  }
  res.sendStatus(204);
});

router.post(
  '/notifications',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { title, message }: { title: string; message: string } = req.body;
    const notificationsService = await createNotificationsService('d4j');

    const userTokens = (await D4jPushToken.find()).map(({ token }) => token);

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
