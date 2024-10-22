import express from 'express';
import mongoose from 'mongoose';

import { currentUser } from '../../../middlewares/current-user';
import { requireAuth } from '../../../middlewares/require-auth';
import { requireAdmin } from '../../../middlewares/require-admin';

const User = mongoose.model('User');
const router = express.Router();

router.delete(
  '/:userId',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const user = await User.findById(req.params.userId);
    if (user.admin) {
      throw Error('You cannot delete an admin user');
    }
    await User.deleteOne({ _id: req.params.userId });
    res.sendStatus(204);
  }
);

export default router;
