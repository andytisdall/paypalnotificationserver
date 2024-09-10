import express from 'express';
import passwordGenerator from 'generate-password';
import mongoose from 'mongoose';

import { requireSalesforceAuth } from '../../middlewares/require-salesforce-auth';

const User = mongoose.model('User');

const router = express.Router();

router.post('/salesforce', requireSalesforceAuth, async (req, res) => {
  const {
    firstName,
    lastName,
    id,
  }: { firstName?: string; lastName: string; id: string } = req.body;

  const existingUser = await User.findOne({ salesforceId: id });

  const temporaryPassword = passwordGenerator.generate({
    length: 10,
    numbers: true,
  });

  if (existingUser) {
    existingUser.password = temporaryPassword;
    await existingUser.save();
    return res.status(200).send({
      username: existingUser.username,
      password: temporaryPassword,
    });
  }

  const username = (
    firstName?.charAt(0).toLowerCase() + lastName.toLowerCase()
  ).replace(' ', '');

  let uniqueUsername = username;
  let existingUsername = await User.findOne({ username });
  let i = 1;
  while (existingUsername) {
    uniqueUsername = username + i;
    existingUsername = await User.findOne({ username: uniqueUsername });
    i++;
  }

  const newUser = new User({
    username: uniqueUsername,
    password: temporaryPassword,
    salesforceId: id,
  });
  await newUser.save();

  res
    .status(201)
    .send({ username: uniqueUsername, password: temporaryPassword });
});

export default router;
