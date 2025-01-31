import express from 'express';
import { formatISO } from 'date-fns';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';
import {
  checkInVolunteer,
  getKitchenVolunteers,
  getTodaysKitchenShifts,
} from '../../utils/salesforce/SFQuery/volunteer/ckKitchen';
import {
  getContactByEmail,
  addContact,
} from '../../utils/salesforce/SFQuery/contact';
import { createHours } from '../../utils/salesforce/SFQuery/volunteer/hours';
import urls from '../../utils/urls';
import fetcher from '../../utils/fetcher';
import { Shift } from '../../utils/salesforce/SFQuery/volunteer/jobs';

const router = express.Router();

router.post('/', async (req, res) => {
  const {
    email,
    firstName,
    lastName,
  }: { email?: string; firstName: string; lastName: string } = req.body;

  if (!firstName || !lastName) {
    throw Error('You must provide first name and last name.');
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

  return res.send(contact);
});

router.get(
  '/check-in/shifts',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const shifts = await getTodaysKitchenShifts();
    res.send(shifts);
  }
);

router.get(
  '/check-in/:shiftId',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { shiftId } = req.params;
    const contacts = await getKitchenVolunteers(shiftId);
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

router.post(
  '/check-in/hours',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { contactId, shiftId }: { contactId: string; shiftId: string } =
      req.body;

    await fetcher.setService('salesforce');
    const { data: shift }: { data: Shift } = await fetcher.get(
      urls.SFOperationPrefix + '/GW_Volunteers__Volunteer_Shift__c/' + shiftId
    );

    // must change desired # of volunteers if the shift is full, otherwise it can't create the hours

    await createHours({
      shiftId,
      contactId,
      jobId: shift.GW_Volunteers__Volunteer_Job__c,
      date: formatISO(new Date()),
    });

    res.sendStatus(204);
  }
);

export default router;
