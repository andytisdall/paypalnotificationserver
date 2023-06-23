import express from 'express';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import fetcher from '../../utils/fetcher';
import {
  getJobs,
  getShifts,
  getHours,
  createHours,
} from '../../utils/salesforce/SFQuery';
import urls from '../../utils/urls';

const router = express.Router();

router.get('/', currentUser, requireAuth, async (req, res) => {
  await fetcher.setService('salesforce');
  const campaigns = urls.activeCampaigns.map(async (id) => {
    const jobs = await getJobs(id);
    const shiftPromises = jobs.map(async (j) => {
      const shifts = await getShifts(j.id);
      j.shifts = shifts.map((sh) => sh.id);
      return shifts;
    });
    const shifts = (await Promise.all(shiftPromises)).flat();
    return { jobs, shifts, id };
  });
  res.send(campaigns);
});

router.get('/hours/:id', currentUser, requireAuth, async (req, res) => {
  const campaignId = req.params.id;
  await fetcher.setService('salesforce');
  const id = req.currentUser!.salesforceId;
  const hours = await getHours(campaignId, id);
  res.send(hours);
});

router.post('/hours/event', currentUser, requireAuth, async (req, res) => {
  const {
    shiftId,
    jobId,
    date,
  }: { shiftId: string; jobId: string; date: string } = req.body;
  const salesforceId = req.currentUser!.salesforceId;
  if (!salesforceId) {
    throw Error('User does not have a salesforce ID');
  }
  const hours = await createHours({
    contactId: salesforceId,
    shiftId,
    jobId,
    date,
  });

  res.status(201);
  res.send(hours);
});
