import express from 'express';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';
import { getTodaysKitchenVolunteers } from '../../utils/salesforce/SFQuery/volunteer/ckKitchen';

const router = express.Router();

router.get(
  '/kitchen/contacts',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const contacts = await getTodaysKitchenVolunteers();
    res.send(contacts);
  }
);

export default router;
