import express from 'express';
import mongoose from 'mongoose';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';
import { sendDonationAckEmail } from '../../utils/email';

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

// router.get('/email-test', async (req, res) => {
//   await sendDonationAckEmail({
//     first_name: 'Andy',
//     last_name: 'Tisdall',
//     payment_gross: '30.50',
//     payer_email: 'andy@ckoakland.org',
//     custom: 'yes',
//   });
//   res.sendStatus(200);
// });

export default router;
