import express from 'express';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';
import mongoose from 'mongoose';

const OutgoingTextRecord = mongoose.model('OutgoingTextRecord');

const router = express.Router();

router.get(
  '/text-records/:startDate',
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

export default router;
