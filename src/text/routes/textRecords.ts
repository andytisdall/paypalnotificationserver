import express from 'express';
import mongoose from 'mongoose';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';

const OutgoingTextRecord = mongoose.model('OutgoingTextRecord');

const router = express.Router();

router.get(
  '/text-records/list/:startDate',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { startDate } = req.params;
    const textRecords = await OutgoingTextRecord.find({
      date: { $gt: new Date(startDate) },
    }).sort({ date: -1 });

    res.send(textRecords);
  }
);

router.get('/text-records/:id', currentUser, requireAuth, async (req, res) => {
  if (!req.currentUser!.busDriver && !req.currentUser!.admin) {
    res.sendStatus(403);
  }
  const textRecord = await OutgoingTextRecord.findById(req.params.id);
  res.send(textRecord);
});

export default router;
