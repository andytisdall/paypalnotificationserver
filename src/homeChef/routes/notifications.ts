import express from "express";
import mongoose from "mongoose";
import { subDays } from "date-fns";
import { NotificationPayload } from "@community-kitchens/apiinterfaces";

import { requireAuth } from "../../middlewares/require-auth";
import { requireAdmin } from "../../middlewares/require-admin";
import createNotificationsService from "../../utils/pushNotifications";

const Notification = mongoose.model("Notification");
const User = mongoose.model("User");

const router = express.Router();

// export interface NotificationData {
//   screen: string;
//   subScreen?: string;
//   params?: Record<string, string>;
// }

// export interface NotificationPayload {
//   title: string;
//   body: string;
//   custom?: NotificationData;
// }

router.post("/notifications", requireAdmin, async (req, res) => {
  const { title, body }: NotificationPayload = req.body;
  const notificationsService = await createNotificationsService("homechef");

  const payload: NotificationPayload = {
    title,
    body,
  };

  let users = [];

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

  const userTokens = users.map((u) => u.homeChefNotificationToken);

  await notificationsService.send(userTokens, payload);
  res.sendStatus(204);
});

router.get("/notifications", requireAuth, async (req, res) => {
  const query = {
    app: "homechef",
    date: { $gt: subDays(new Date(), 14) },
  };

  const notifications = await Notification.find(query).sort([["date", -1]]);

  res.send(notifications);
});

router.get("/notifications/:days", requireAuth, async (req, res) => {
  const days = req.params.days as string;
  const daysInt = parseInt(days);
  let query;

  if (!isNaN(daysInt)) {
    query = {
      app: "homechef",
      date: { $gt: subDays(new Date(), daysInt) },
    };
  } else {
    query = {
      app: "homechef",
    };
  }

  const notifications: Notification[] = await Notification.find(query).sort([
    ["date", -1],
  ]);
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
