import express from "express";
import mongoose from "mongoose";
import {
  NotificationPayload,
  Notification as NotificationType,
} from "@community-kitchens/apiinterfaces";

import { requireAdmin } from "../../middlewares/require-admin";
import createNotificationsService from "../../utils/pushNotifications";
import { D4JUser } from "../models/d4jUser";
import { currentD4JUser } from "../../middlewares/current-d4j-user";

export interface Announcement {
  title: string;
  message: string;
  photo?: string;
  data?: NotificationType;
}

const Notification = mongoose.model("Notification");

const router = express.Router();

router.post("/notifications", requireAdmin, async (req, res) => {
  const { title, body, custom }: NotificationPayload = req.body;
  const notificationsService = await createNotificationsService("d4j");

  const payload: NotificationPayload = {
    title,
    body,
  };
  let users = [];

  if (process.env.NODE_ENV === "production") {
    const newNotification = new Notification({
      payload,
      app: "d4j",
    });
    await newNotification.save();

    users = await D4JUser.find({ token: { $ne: undefined } });
  } else {
    users = await D4JUser.find({ email: "andy@ckoakland.org" });
  }
  const userTokens = users.map((user) => user.token) as string[];

  if (custom?.screen) {
    payload.custom = custom;
  }

  await notificationsService.send(userTokens, payload);

  res.sendStatus(204);
});

router.get("/notifications", requireAdmin, async (req, res) => {
  const notifications = await Notification.find({ app: "d4j" }).sort([
    ["date", -1],
  ]);
  res.send(notifications);
});

router.get("/announcement", async (req, res) => {
  res.send(null);
});

router.post("/save-token", currentD4JUser, async (req, res) => {
  const { token }: { token: string } = req.body;
  console.log(token);
  const user = await D4JUser.findById(req.currentD4JUser!.id);

  if (user) {
    user.token = token;
    await user.save();
  }

  res.sendStatus(204);
});

export default router;
