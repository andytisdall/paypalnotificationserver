import express from 'express';

import { currentUser } from '../../middlewares/current-user';
import fetcher from '../../utils/fetcher';
import { getContactById } from '../../utils/salesforce/SFQuery/contact';
import { getJobs, getShifts } from '../../utils/salesforce/SFQuery/jobs';
import {
  getHours,
  deleteVolunteerHours,
} from '../../utils/salesforce/SFQuery/hours';
import { getCampaignFromHours } from '../../utils/salesforce/SFQuery/campaign';
import urls from '../../utils/urls';
import {
  sendKitchenShiftCancelEmail,
  sendEventShiftCancelEmail,
} from '../../utils/email';

const router = express.Router();

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

export default router;
