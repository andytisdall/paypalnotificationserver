import express from 'express';

import {
  getContactByEmail,
  addContact,
} from '../../utils/salesforce/SFQuery/contact';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import fetcher from '../../utils/fetcher';
import { getContactById } from '../../utils/salesforce/SFQuery/contact';
import { getJobs, getShifts } from '../../utils/salesforce/SFQuery/jobs';
import {
  getHours,
  createHours,
  deleteVolunteerHours,
} from '../../utils/salesforce/SFQuery/hours';
import {
  getVolunteerCampaigns,
  getCampaignFromHours,
  insertCampaignMember,
} from '../../utils/salesforce/SFQuery/campaign';
import urls from '../../utils/urls';
import {
  sendKitchenShiftCancelEmail,
  sendEventShiftCancelEmail,
} from '../../utils/email';

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

router.get('/events', async (req, res) => {
  await fetcher.setService('salesforce');
  const campaigns = await getVolunteerCampaigns();
  const campaignPromises = campaigns.map(async (campaign) => {
    const jobs = await getJobs(campaign.id);
    const shiftPromises = jobs.map(async (j) => {
      const shifts = await getShifts(j.id);
      j.shifts = shifts.map((sh) => sh.id);
      return shifts;
    });
    const shifts = (await Promise.all(shiftPromises)).flat();
    return { jobs, shifts, ...campaign };
  });
  const campaignsWithJobsAndShifts = await Promise.all(campaignPromises);
  res.send(campaignsWithJobsAndShifts);
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

router.get('/kitchen/hours/:contactId?', async (req, res) => {
  await fetcher.setService('salesforce');
  const contactId = req.params.contactId;
  if (!contactId) {
    return res.sendStatus(204);
  }
  const hours = await getHours(urls.ckKitchenCampaignId, contactId);
  res.send(hours);
});

router.get('/hours/:campaignId/:contactId?', async (req, res) => {
  const campaignId = req.params.campaignId;
  const contactId = req.params.contactId;
  if (!contactId) {
    return res.send(204);
  }
  await fetcher.setService('salesforce');
  const shortenedCampaignId = campaignId.substring(0, campaignId.length - 3);
  const hours = await getHours(shortenedCampaignId, contactId);
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

router.delete(
  '/kitchen/hours/:id/:salesforceId?',
  currentUser,
  async (req, res) => {
    const id = req.params.id;
    const salesforceId = req.params.salesforceId;

    let contactId = '';
    if (req.currentUser) {
      contactId = req.currentUser.salesforceId;
    } else {
      contactId = salesforceId;
    }

    if (!contactId) {
      throw Error('Could not find contact');
    }

    const hours = await getHours(urls.ckKitchenCampaignId, contactId);
    const hour = hours.find((h) => h.id === id);

    if (hour) {
      await deleteVolunteerHours(id);
      const { Email, FirstName } = await getContactById(contactId);
      if (Email) {
        await sendKitchenShiftCancelEmail(Email, {
          date: hour.time,
          name: FirstName,
        });
      }
      res.sendStatus(204);
    } else {
      throw Error('Volunteer hours do not belong to this contact');
    }
  }
);

router.delete('/hours/:id/:salesforceId?', currentUser, async (req, res) => {
  const id = req.params.id;
  const salesforceId = req.params.salesforceId;

  let contactId = '';
  if (req.currentUser) {
    contactId = req.currentUser.salesforceId;
  } else {
    contactId = salesforceId;
  }

  if (!contactId) {
    throw Error('Could not find contact');
  }

  const campaign = await getCampaignFromHours(id);

  if (!campaign) {
    throw Error('Could not get campaign info');
  }

  const hours = await getHours(campaign.id, contactId);
  const hour = hours.find((h) => h.id === id);

  if (hour) {
    await deleteVolunteerHours(id);
    const { Email, FirstName } = await getContactById(contactId);
    if (Email) {
      await sendEventShiftCancelEmail(Email, {
        date: hour.time,
        name: FirstName,
        event: campaign.name,
      });
    }
    res.sendStatus(204);
  } else {
    throw Error('Volunteer hours do not belong to this contact');
  }
});

router.post('/home-chef-registration', async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    phone,
  }: { email: string; firstName?: string; lastName?: string; phone?: string } =
    req.body;

  let contact = await getContactByEmail(email);
  if (!contact) {
    contact = await addContact({
      Email: email,
      FirstName: firstName,
      LastName: lastName,
      HomePhone: phone,
    });
  }

  await insertCampaignMember({
    ContactId: contact.id!,
    CampaignId: urls.homeChefInPersonCampaignId,
    Status: 'Confirmed',
  });

  res.send(204);
});

export default router;
