import express from "express";
import mongoose from "mongoose";

import { currentD4JUser } from "../../middlewares/current-d4j-user";
import { requireAdmin } from "../../middlewares/require-admin";
import { EventConfig, D4JAppVersion } from "@community-kitchens/apiinterfaces";

const Event = mongoose.model("Event");

export const STYLE_WEEK_ID = "67044fab8f93ddc0f28e0bce";
const EVENT_COORDS = {
  latitude: 37.805796,
  longitude: -122.2711,
};

// const EVENT_COORDS = { latitude: 37.790927, longitude: -122.204976 };

const START_TIME = new Date(2026, 9, 7, 17, 30);
const END_TIME = new Date(2026, 9, 7, 20, 0);

const router = express.Router();

const LATEST_D4J_APP_VERSION = "2.8";

router.get("/version", (_req, res) => {
  const d4jAppVersion: D4JAppVersion = {
    currentVersion: LATEST_D4J_APP_VERSION,
  };
  res.send(d4jAppVersion);
});

router.get("/style-week", currentD4JUser, async (req, res) => {
  const config: EventConfig = {
    contestActive: false,
    coordinates: EVENT_COORDS,
    startTime: START_TIME.toString(),
    endTime: END_TIME.toString(),
  };
  if (
    req.currentD4JUser?.email === "andy@ckoakland.org" ||
    process.env.NODE_ENV === "development"
  ) {
    return res.send({
      ...config,
      contestActive: true,
    });
  }

  res.send(config);
});

router.post("/style-week", requireAdmin, async (req, res) => {
  const { contestActive }: EventConfig = req.body;
  const event = await Event.findById(STYLE_WEEK_ID);

  event.contestActive = contestActive;
  await event.save();
  res.sendStatus(204);
});

export default router;
