import express from "express";
import mongoose from "mongoose";

import { currentD4JUser } from "../../middlewares/current-d4j-user";
import { requireAdmin } from "../../middlewares/require-admin";
import { EventConfig, D4JAppVersion } from "@community-kitchens/apiinterfaces";

const Event = mongoose.model("Event");

export const STYLE_WEEK_ID = "67044fab8f93ddc0f28e0bce";
// real coords

// const EVENT_COORDS = {
//   latitude: 37.805796,
//   longitude: -122.2711,
// };

// house coords
// const EVENT_COORDS = {
//   latitude: 37.791091357810714,
//   longitude: -122.2039671326603,
// };

// ck coords
// const EVENT_COORDS = {
//   latitude: 37.812513000444646,
//   longitude: -122.2684817010495,
// };

// android coords
const EVENT_COORDS = { latitude: 37.421998, longitude: -122.084 };
// real time
// const START_TIME = new Date(2026, 9, 7, 17, 30);
// const END_TIME = new Date(2026, 9, 7, 20, 0);

// fake time
const START_TIME = new Date(2026, 8, 18, 16, 59);
const END_TIME = new Date(2026, 8, 18, 19, 10);

// const EVENT_DATE = new Date(2026, 8, 16);

const router = express.Router();

const LATEST_D4J_APP_VERSION = "2.12";

router.get("/version", (_req, res) => {
  const d4jAppVersion: D4JAppVersion = {
    currentVersion: LATEST_D4J_APP_VERSION,
  };
  res.send(d4jAppVersion);
});

router.get("/style-week", currentD4JUser, async (req, res) => {
  const event = await Event.findById(STYLE_WEEK_ID);

  const config: EventConfig = {
    contestActive: event.contestActive,
    coordinates: EVENT_COORDS,
    startTime: START_TIME.toString(),
    endTime: END_TIME.toString(),
  };

  res.send(config);
});

router.post("/style-week", requireAdmin, async (req, res) => {
  const { active }: { active: boolean } = req.body;
  const event = await Event.findById(STYLE_WEEK_ID);

  event.contestActive = active;
  await event.save();
  res.send(null);
});

export default router;
