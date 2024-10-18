import express from 'express';
import mongoose from 'mongoose';

import { currentD4JUser } from '../../middlewares/current-d4j-user';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';

interface EventConfig {
  contestActive: boolean;
  styleMonthActive: boolean;
}

const Event = mongoose.model('Event');

export const STYLE_WEEK_ID = '67044fab8f93ddc0f28e0bce';

const router = express.Router();

const LATEST_D4J_APP_VERSION = '2.4';

router.get('/version', (req, res) => {
  res.send({ currentVersion: LATEST_D4J_APP_VERSION });
});

router.get('/style-week', currentD4JUser, async (req, res) => {
  // if (req.currentD4JUser?.email === 'andy@ckoakland.org') {
  //   return res.send({ contestActive: true, styleMonthActive: true });
  // }
  const styleWeekEvent = await Event.findById(STYLE_WEEK_ID);
  res.send(styleWeekEvent);
});

router.post(
  '/style-week',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { contestActive, styleMonthActive }: EventConfig = req.body;
    const event = await Event.findById(STYLE_WEEK_ID);

    event.contestActive = contestActive;
    event.styleMonthActive = styleMonthActive;
    await event.save();
    res.sendStatus(204);
  }
);

export default router;
