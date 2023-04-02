import mongoose from 'mongoose';
import express from 'express';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';
import { addTextSubscriber } from '../../utils/salesforce/SFQuery';
import { PhoneNumber } from './incomingText';

const router = express.Router();

const Phone = mongoose.model('Phone');

router.get(
  '/migrate-text',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const allTextNumbers: PhoneNumber[] = await Phone.find({});
    const promises = allTextNumbers
      .filter((p) => p && p.number && p.region)
      .map((phone) => {
        return addTextSubscriber(phone!.number, phone!.region);
      });
    await Promise.all(promises);
    res.sendStatus(200);
  }
);
