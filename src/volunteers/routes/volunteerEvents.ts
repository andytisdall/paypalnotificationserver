import express from 'express';

import fetcher from '../../utils/fetcher';
import { getVolunteerCampaigns } from '../../utils/salesforce/SFQuery/campaign';
import { getJobs, getShifts } from '../../utils/salesforce/SFQuery/jobs';
import { getHours } from '../../utils/salesforce/SFQuery/hours';

const router = express.Router();

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

router.get('/hours/:campaignId/:contactId?', async (req, res) => {
  const campaignId = req.params.campaignId;
  const contactId = req.params.contactId;
  if (!contactId) {
    return res.sendStatus(204);
  }
  await fetcher.setService('salesforce');
  const shortenedCampaignId = campaignId.substring(0, campaignId.length - 3);
  const hours = await getHours(shortenedCampaignId, contactId);
  res.send(hours);
});

export default router;
