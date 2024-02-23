import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import { currentD4JUser } from '../middlewares/current-d4j-user';
import {
  addContact,
  getContactByEmail,
} from '../utils/salesforce/SFQuery/contact';
import getSecrets from '../utils/getSecrets';

const D4JUser = mongoose.model('D4JUser');

const router = express.Router();

router.post('/contact/signin', async (req, res) => {
  const { email, token } = req.body;

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

export default router;
