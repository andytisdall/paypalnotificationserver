import express from "express";
import mongoose from "mongoose";

import { currentD4JUser } from "../../middlewares/current-d4j-user";
import { requireAdmin } from "../../middlewares/require-admin";

interface EventConfig {
  contestActive: boolean;
  styleMonthActive: boolean;
}

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
  res.send({ currentVersion: LATEST_D4J_APP_VERSION });
});

router.get("/style-week", currentD4JUser, async (req, res) => {
  if (
    req.currentD4JUser?.email === "andy@ckoakland.org" ||
    process.env.NODE_ENV === "development"
  ) {
    return res.send({
      contestActive: true,
      coordinates: EVENT_COORDS,
      startTime: START_TIME,
      endTime: END_TIME,
    });
  }
  res.send({ contestActive: false, styleMonthActive: false });
  // const styleWeekEvent = await Event.findById(STYLE_WEEK_ID);
  // res.send(styleWeekEvent);
});

router.post("/style-week", requireAdmin, async (req, res) => {
  const { contestActive, styleMonthActive }: EventConfig = req.body;
  const event = await Event.findById(STYLE_WEEK_ID);

  event.contestActive = contestActive;
  event.styleMonthActive = styleMonthActive;
  await event.save();
  res.sendStatus(204);
});

export default router;
