import express from 'express';
import mongoose from 'mongoose';

import getSecrets from '../../utils/getSecrets';
import { Password } from '../password';
import jwt from 'jsonwebtoken';

const User = mongoose.model('User');

const router = express.Router();

router.post('/signin', async (req, res) => {
  const { JWT_KEY } = await getSecrets(['JWT_KEY']);
  if (!JWT_KEY) {
    throw Error('No JWT key found');
  }

  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });
  if (!existingUser) {
    res.status(401);
    throw new Error('Credentials Invalid');
  }

  const passwordsMatch = await Password.compare(
    existingUser.password,
    password
  );

  if (!passwordsMatch) {
    res.status(401);
    throw new Error('Credentials Invalid');
  }

  const token = jwt.sign(
    {
      id: existingUser.id,
    },
    JWT_KEY
  );

  res.send({ user: existingUser, token });
});

export default router;
