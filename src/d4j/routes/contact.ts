import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { generate } from 'generate-password';

import { currentD4JUser } from '../../middlewares/current-d4j-user';
import {
  addContact,
  getContactByEmail,
  deleteContact,
} from '../../utils/salesforce/SFQuery/contact';
import getSecrets from '../../utils/getSecrets';
import { sendEmail } from '../../utils/email';
import { CheckIn } from '../models/checkIn';
import { deleteAllUserCheckIns } from '../../utils/salesforce/SFQuery/d4j';

const D4JUser = mongoose.model('D4JUser');

const router = express.Router();

router.post('/contact/signin', async (req, res) => {
  const { email, token }: { email: string; token?: string } = req.body;

  let user = await D4JUser.findOne({ email });

  if (!user) {
    // get salesforce contact
    const contact = await getContactByEmail(email);
    if (!contact) {
      return res.sendStatus(204);
    }
    user = new D4JUser({ email, salesforceId: contact.id, token });
    await user.save();
  }

  if (token && token !== user.token) {
    user.token = token;
    await user.save();
  }

  const { JWT_KEY } = await getSecrets(['JWT_KEY']);
  if (!JWT_KEY) {
    throw Error('Could not find JWT secret key');
  }

  const jwtToken = jwt.sign(
    {
      id: user.id,
    },
    JWT_KEY
  );

  res.send({ contact: user, token: jwtToken });
});

router.post('/contact', async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    token,
  }: { email: string; firstName: string; lastName: string; token?: string } =
    req.body;

  console.log('call to post contact');

  if (!email || !firstName || !lastName) {
    throw Error('You must provide an email, first name and last name.');
  }

  const existingUser = await D4JUser.findOne({ email });
  if (existingUser) {
    throw Error('There is already an account with this email address');
  }

  const newUser = new D4JUser({ email, token });
  await newUser.save();

  const { JWT_KEY } = await getSecrets(['JWT_KEY']);
  if (!JWT_KEY) {
    throw Error('Could not find JWT secret key');
  }
  const jwtToken = jwt.sign(
    {
      id: newUser.id,
    },
    JWT_KEY
  );

  res.send({ contact: newUser, token: jwtToken });

  const contact = await addContact({
    Email: email,
    FirstName: firstName,
    LastName: lastName,
  });

  newUser.salesforceId = contact.id;
  newUser.save();
});

router.get('/contact', currentD4JUser, async (req, res) => {
  if (!req.currentD4JUser) {
    return res.sendStatus(204);
  }
  res.send(req.currentD4JUser);
});

router.get('/delete-account/:email', async (req, res) => {
  const { email } = req.params;

  const code = generate({ length: 5, numbers: true });

  const emailText = `<p>Your code from Community Kitchens is</p><p><strong>${code}</strong></p>`;

  const user = await D4JUser.findOne({ email });

  if (!user) {
    throw Error('User not found');
  }

  user.secretCode = code;
  await user.save();

  await sendEmail({
    to: email,
    from: 'andy@ckoakland.org',
    subject: 'Your code from CK',
    html: emailText,
  });

  res.sendStatus(204);
});

router.post('/delete-account', async (req, res) => {
  const { code, email }: { code: string; email: string } = req.body;

  const user = await D4JUser.findOne({ email });

  if (!code === user.secretCode) {
    throw Error('Incorrect Code');
  }

  // delete salesforce check ins
  const checkIns = await CheckIn.find({ user: user.id });
  const allCheckInIds = checkIns
    .map(({ salesforceId }: { salesforceId?: string }) => salesforceId)
    .filter((item) => item);
  //@ts-ignore
  await deleteAllUserCheckIns(allCheckInIds);

  // delete salesforce contact
  await deleteContact(user.salesforceId);

  // delete mongo check ins
  await CheckIn.deleteMany({ user: user.id });

  // delete user
  await D4JUser.deleteOne({ email });

  res.sendStatus(204);
});

export default router;
