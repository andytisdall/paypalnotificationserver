import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import getSecrets from '../../../utils/getSecrets';
import { currentUser } from '../../../middlewares/current-user';
import { requireAuth } from '../../../middlewares/require-auth';
import { requireAdmin } from '../../../middlewares/require-admin';

const User = mongoose.model('User');

const router = express.Router();

router.post(
  '/admin-auth',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { userId }: { userId: string } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      throw Error('User not found');
    }

    const { JWT_KEY } = await getSecrets(['JWT_KEY']);
    if (!JWT_KEY) {
      throw Error('No JWT key found');
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      JWT_KEY
    );

    res.send({ user, token });
  }
);

export default router;
