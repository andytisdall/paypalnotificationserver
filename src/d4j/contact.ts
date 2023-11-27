import express from 'express';
import jwt from 'jsonwebtoken';

import { currentD4JUser } from '../middlewares/current-d4j-user';
import {
  getContactByEmail,
  addContact,
} from '../utils/salesforce/SFQuery/contact';
import getSecrets from '../utils/getSecrets';

const router = express.Router();

router.post('/contact/signin', async (req, res) => {
  const { email } = req.body;
  const contact = await getContactByEmail(email);

  if (!contact) {
    return res.sendStatus(204);
  }
  const { JWT_KEY } = await getSecrets(['JWT_KEY']);
  if (!JWT_KEY) {
    throw Error('Could not find JWT secret key');
  }

  const token = jwt.sign(
    {
      id: contact.id,
    },
    JWT_KEY
  );
  res.send({ contact, token });
});

router.post('/contact', async (req, res) => {
  const {
    email,
    firstName,
    lastName,
  }: { email: string; firstName: string; lastName: string } = req.body;

  if (!email || !firstName || !lastName) {
    throw Error('You must provide an email, first name and last name.');
  }

  const contact = await addContact({
    Email: email,
    FirstName: firstName,
    LastName: lastName,
  });

  const { JWT_KEY } = await getSecrets(['JWT_KEY']);
  if (!JWT_KEY) {
    throw Error('Could not find JWT secret key');
  }

  const token = jwt.sign(
    {
      id: contact.id,
    },
    JWT_KEY
  );
  res.send({ contact, token });
});

router.get('/contact', currentD4JUser, async (req, res) => {
  if (!req.currentD4JUser) {
    return res.sendStatus(204);
  }
  res.send(req.currentD4JUser);
});

export default router;
