import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import getSecrets from '../../../utils/getSecrets';

const User = mongoose.model('User');
const router = express.Router();

router.post('/reset-password', async (req, res) => {
  const { token, password }: { token: string; password: string } = req.body;

  const { JWT_KEY } = await getSecrets(['JWT_KEY']);
  if (!JWT_KEY) {
    throw Error('No JWT key found');
  }
  try {
    const { id, expiresAt } = jwt.verify(token, JWT_KEY) as unknown as {
      id: string;
      expiresAt: string;
    };

    const user = await User.findById(id);
    if (!user) {
      throw Error('Invalid reset token');
    }
    if (new Date(expiresAt) < new Date()) {
      throw Error('Reset token has expired');
    }
    if (user) {
      user.password = password;
      await user.save();
    }
    return res.sendStatus(204);
  } catch (err) {
    throw Error('Unable to reset password');
  }
});

export default router;
