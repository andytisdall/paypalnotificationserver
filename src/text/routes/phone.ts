import express from 'express';
import mongoose from 'mongoose';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireTextPermission } from '../../middlewares/require-text-permission';
import { Region } from '../models/phone';
import {
  addTextSubscriber,
  editTextSubscriber,
  removeTextSubscriber,
} from '../../utils/salesforce/SFQuery/text';
import { requireAdmin } from '../../middlewares/require-admin';
import { PhoneNumber } from './incomingText';

const Phone = mongoose.model('Phone');
const router = express.Router();

router.get(
  '/phone/:number',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const phoneNumber = req.params.number.replace(/[^\d]/g, '');
    const phone = await Phone.findOne({ number: '+1' + phoneNumber });
    if (!phone) {
      throw Error(
        'Phone number does not exist on the list of text subscribers'
      );
    }
    res.send(phone);
  }
);

router.post(
  '/phone',
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

    const existingNumber: PhoneNumber = await Phone.findOne({
      number: '+1' + phoneNumber,
    });
    if (existingNumber) {
      if (existingNumber.region.includes(region)) {
        res.status(422);
        throw new Error('Phone number is already in database');
      } else {
        existingNumber.region.push(region);
        await existingNumber.save();
        await editTextSubscriber(existingNumber.number, existingNumber.region);
        return res.send(existingNumber);
      }
    }

    const newPhone: PhoneNumber = new Phone({
      number: '+1' + phoneNumber,
      region: [region],
    });
    await newPhone!.save();
    await addTextSubscriber(newPhone!.number, newPhone!.region);
    res.send(newPhone);
  }
);

router.delete(
  '/phone/:id',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const id = req.params.id;
    const numberToDelete: PhoneNumber = await Phone.findById(id);
    if (!numberToDelete) {
      throw Error('Phone number not found');
    }
    await removeTextSubscriber(numberToDelete.number);
    await Phone.deleteOne({ _id: id });
    res.sendStatus(204);
  }
);

export default router;
