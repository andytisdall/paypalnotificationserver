import express from 'express';
import mongoose from 'mongoose';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireTextPermission } from '../../middlewares/require-text-permission';
import { Region } from '../models/phone';
import { addTextSubscriber } from '../../utils/salesforce/SFQuery';

const Phone = mongoose.model('Phone');
const router = express.Router();

router.post(
  '/addphone',
  currentUser,
  requireAuth,
  requireTextPermission,
  async (req, res) => {
    const { phone, region }: { phone: string; region: Region } = req.body;

    if (!phone) {
      res.status(422);
      throw new Error('No Phone Number in Request Body');
    }

    if (!region) {
      res.status(422);
      throw new Error('No Region in Request Body');
    }

    if (!['EAST_OAKLAND', 'WEST_OAKLAND'].includes(region)) {
      res.status(422);
      throw new Error('Region not recognized');
    }

    const phoneNumber = phone.replace(/[^\d]/g, '');

    if (phoneNumber.length !== 10) {
      res.status(422);
      throw new Error('Phone number must have 10 digits');
    }

    const existingNumber = await Phone.findOne({ number: '+1' + phoneNumber });
    if (existingNumber) {
      if (existingNumber.region.includes(region)) {
        res.status(422);
        throw new Error('Phone number is already in database');
      } else {
        existingNumber.region.push(region);
        await existingNumber.save();
        return res.send(existingNumber);
      }
    }

    const newPhone = new Phone({
      number: '+1' + phoneNumber,
      region: [region],
    });
    await newPhone.save();
    await addTextSubscriber(newPhone.number, newPhone.region);
    res.send(newPhone);
  }
);

export default router;
