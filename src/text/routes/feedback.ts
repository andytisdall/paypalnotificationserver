import express from 'express';
import mongoose from 'mongoose';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';

const Feedback = mongoose.model('Feedback');
const router = express.Router();

router.get(
  '/feedback',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const allFeedback = await Feedback.find();
    res.send(allFeedback);
  }
);

router.patch(
  '/feedback/:id',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      throw Error('Could not find feedback');
    }
    feedback.read = true;
    await feedback.save();
    res.send(feedback);
  }
);
router.delete(
  '/feedback/:id',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    await Feedback.deleteOne({ _id: id });
    res.send(id);
  }
);

export default router;
