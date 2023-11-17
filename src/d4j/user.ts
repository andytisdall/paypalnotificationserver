import express from 'express';

import {
  getContactByEmail,
  addContact,
} from '../utils/salesforce/SFQuery/contact';

const router = express.Router();

router.get('/user/:email', async (req, res) => {
  const { email } = req.params;
  const contact = await getContactByEmail(email);
  res.send(contact);
});

router.post('/user', async (req, res) => {
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
  res.send(contact);
});

export default router;
