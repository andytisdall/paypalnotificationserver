import express from "express";
import mongoose from "mongoose";
import { subDays } from "date-fns";

import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { requireAdmin } from "../../middlewares/require-admin";
import createNotificationsService from "../../utils/pushNotifications";

const Notification = mongoose.model("Notification");
const User = mongoose.model("User");

const router = express.Router();

export interface NotificationData {
  screen: string;
  subScreen?: string;
  params?: Record<string, string>;
}

export interface NotificationPayload {
  title: string;
  body: string;
  custom?: NotificationData;
}

router.post(
  "/notifications",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const {
      title,
      message,
    }: {
      title: string;
      message: string;
    } = req.body;
    const notificationsService = await createNotificationsService("homechef");

    const payload: NotificationPayload = {
      title,
      body: message,
    };

    let users: any;

    if (process.env.NODE_ENV === "production") {
      users = await User.find({
        homeChefNotificationToken: { $ne: undefined },
      });

      const newNotification = new Notification({
        payload,
        app: "homechef",
      });
      await newNotification.save();
    } else {
      users = await User.find({
        $or: [
          {
            username: "Andy",
          },
          { username: "Testo" },
        ],
      });
    }

    const userTokens = users.map((u: any) => u.homeChefNotificationToken);

    await notificationsService.send(userTokens, payload);
    res.sendStatus(204);
  }
);

router.get("/notifications", currentUser, requireAuth, async (req, res) => {
  const notifications = await Notification.find({
    app: "homechef",
    date: { $gt: subDays(new Date(), 14) },
  }).sort([["date", -1]]);
  // const notifications = [
  //   {
  //     date: new Date(),
  //     payload: { title: 'Hi There', message: 'fwo84hrow4hfw4lij' },
  //   },
  //   {
  //     date: new Date(),
  //     payload: { title: 'Hi There', message: 'fwo84hrow4hfw4lij' },
  //   },
  //   {
  //     date: new Date(),
  //     payload: { title: 'Hi There', message: 'fwo84hrow4hfw4lij' },
  //   },
  //   {
  //     date: new Date(),
  //     payload: { title: 'Hi There', message: 'fwo84hrow4hfw4lij' },
  //   },
  //   {
  //     date: new Date(),
  //     payload: { title: 'Hi There', message: 'fwo84hrow4hfw4lij' },
  //   },
  //   {
  //     date: new Date(),
  //     payload: { title: 'Hi There', message: 'fwo84hrow4hfw4lij' },
  //   },
  // ];
  res.send(notifications);
});

export default router;
