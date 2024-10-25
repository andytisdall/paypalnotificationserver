import express from 'express';

import { createHours } from '../../utils/salesforce/SFQuery/hours';
import {
  getContactByEmail,
  addContact,
  getContact,
} from '../../utils/salesforce/SFQuery/contact';

const SHIFT_ID = 'a0yU8000000VKNRIA4';
const JOB_ID = 'a0wU8000002AsM9IAK';
const DATE = '2024-12-14';

const router = express.Router();

router.post('/hours', async (req, res) => {
  const {
    shiftId,
    jobId,
    date,
    contactSalesforceId,
  }: {
    shiftId: string;
    jobId: string;
    date: string;
    contactSalesforceId: string;
  } = req.body;

  const hours = await createHours({
    contactId: contactSalesforceId,
    shiftId,
    jobId,
    date,
  });

  res.status(201);
  res.send(hours);
});

router.post('/hours/cookies', async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    phone,
  }: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  } = req.body;

  let contact = await getContactByEmail(email);
  if (!contact) {
    contact = await getContact(lastName, firstName);
  }
  if (!contact) {
    contact = await addContact({
      Email: email,
      FirstName: firstName,
      LastName: lastName,
      HomePhone: phone,
      CK_Kitchen_Volunteer_Status__c: 'Prospective',
      GW_Volunteers__Volunteer_Status__c: 'Prospective',
    });
  }

  if (!contact) {
    throw Error('could not get contact');
  }

  await createHours({
    contactId: contact.id!,
    shiftId: SHIFT_ID,
    jobId: JOB_ID,
    date: DATE,
  });

  res.sendStatus(204);
});

export default router;
