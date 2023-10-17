import express from 'express';

import {
  getContactByEmail,
  addContact,
} from '../../utils/salesforce/SFQuery/contact';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import fetcher from '../../utils/fetcher';
import { getJobs, getShifts } from '../../utils/salesforce/SFQuery/jobs';
import { getHours, createHours } from '../../utils/salesforce/SFQuery/hours';
import { getCampaign } from '../../utils/salesforce/SFQuery/campaign';
import urls from '../../utils/urls';

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
  });
  res.send(contact);
});

router.get('/events', currentUser, requireAuth, async (req, res) => {
  await fetcher.setService('salesforce');
  const campaignPromises = urls.activeCampaigns.map(async (id) => {
    const campaign = await getCampaign(id);
    const jobs = await getJobs(id);
    const shiftPromises = jobs.map(async (j) => {
      const shifts = await getShifts(j.id);
      j.shifts = shifts.map((sh) => sh.id);
      return shifts;
    });
    const shifts = (await Promise.all(shiftPromises)).flat();
    return { jobs, shifts, ...campaign };
  });
  const campaigns = await Promise.all(campaignPromises);
  res.send(campaigns);
});

router.get('/kitchen', async (req, res) => {
  await fetcher.setService('salesforce');
  const jobs = await getJobs(urls.ckKitchenCampaignId);
  const shiftPromises = jobs.map(async (j) => {
    const shifts = await getShifts(j.id);
    j.shifts = shifts.map((sh) => sh.id);
    return shifts;
  });
  const shifts = (await Promise.all(shiftPromises)).flat();
  res.send({ jobs, shifts });
});

router.get('/kitchen/hours/:contactId', async (req, res) => {
  await fetcher.setService('salesforce');
  const contactId = req.params.contactId;
  const hours = await getHours(urls.ckKitchenCampaignId, contactId);
  res.send(hours);
});

router.get('/hours/:id', currentUser, requireAuth, async (req, res) => {
  const campaignId = req.params.id;
  await fetcher.setService('salesforce');
  const id = req.currentUser!.salesforceId;
  const hours = await getHours(campaignId, id);
  res.send(hours);
});

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

router.get('/:email', async (req, res) => {
  const { email } = req.params;
  const contact = await getContactByEmail(email);
  res.send(contact);
});

export default router;
