import express from 'express';
import mongoose from 'mongoose';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';
import createNotificationsService from '../../utils/pushNotifications';
import { D4JUser } from '../models/d4jUser';
import {
  NotificationPayload,
  NotificationData,
} from '../../homeChef/routes/notifications';

export interface Announcement {
  title: string;
  message: string;
  photo?: string;
  data?: NotificationData;
}

const Notification = mongoose.model('Notification');

const router = express.Router();

router.post(
  '/notifications',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const {
      title,
      message,
      screen,
      subScreen,
      params,
    }: {
      title: string;
      message: string;
      screen?: string;
      subScreen?: string;
      params?: Record<string, string>;
    } = req.body;
    const notificationsService = await createNotificationsService('d4j');

    const userTokens = (await D4JUser.find())
      .filter((user) => user.token)
      .map(({ token }) => token) as string[];

    const payload: NotificationPayload = {
      title,
      body: message,
    };

    if (screen) {
      payload.custom = {
        screen,
        subScreen,
        params,
      };
    }

    await notificationsService.send(userTokens, payload);
    const newNotification = new Notification({
      payload,
      app: 'd4j',
    });
    await newNotification.save();

    res.sendStatus(204);
  }
);

router.get(
  '/notifications',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const notifications = await Notification.find({ app: 'd4j' }).sort([
      ['date', -1],
    ]);
    res.send(notifications);
  }
);

router.get('/announcement', async (req, res) => {
  const payload: Announcement = {
    title: "Tito's Street Fighter and Karaoke Crawl!",
    message:
      'Join us for the Cocktails for a Cause wrap party at Beeryland & Legionnaire on Wednesday, July 3rd',
    data: {
      screen: 'Events',
      subScreen: 'EventDetail',
      params: { id: '701UP000007gx66YAA' },
    },
    photo:
      'https://storage.googleapis.com/coherent-vision-368820.appspot.com/ryu.jpeg',
  };

  res.send(payload);
});

export default router;
