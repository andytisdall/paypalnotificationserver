import express from 'express';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';
import {
  checkInVolunteer,
  getTodaysKitchenVolunteers,
} from '../../utils/salesforce/SFQuery/volunteer/ckKitchen';
import {
  getContactByEmail,
  addContact,
} from '../../utils/salesforce/SFQuery/contact';

const router = express.Router();

router.post('/', async (req, res) => {
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
    CK_Kitchen_Volunteer_Status__c: 'Prospective',
  });
  res.send(contact);
});

router.get('/:email', async (req, res) => {
  const { email } = req.params;
  const contact = await getContactByEmail(email);

  return res.send({ ...contact, email });
});

router.get(
  '/kitchen/contacts',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const contacts = await getTodaysKitchenVolunteers();
    res.send(contacts);
  }
);

router.post(
  '/check-in',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { hoursId }: { hoursId: string } = req.body;

    await checkInVolunteer(hoursId);

    res.sendStatus(204);
  }
);

export default router;
