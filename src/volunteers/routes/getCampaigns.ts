import express from 'express';

import fetcher from '../../utils/fetcher';
import {
  getCampaign,
  getVolunteerCampaigns,
} from '../../utils/salesforce/SFQuery/volunteer/campaign/campaign';
import {
  getJobs,
  getShifts,
} from '../../utils/salesforce/SFQuery/volunteer/jobs';
import urls from '../../utils/urls';

const router = express.Router();

router.get('/events', async (req, res) => {
  await fetcher.setService('salesforce');
  const campaigns = await getVolunteerCampaigns();
  const ckKitchenCampaign = await getCampaign(urls.ckKitchenCampaignId);
  const campaignPromises = [...campaigns, ckKitchenCampaign].map(
    async (campaign) => {
      const jobs = await getJobs(campaign.id);
      const shiftPromises = jobs.map(async (j) => {
        const shifts = await getShifts(j.id);
        j.shifts = shifts.map((sh) => sh.id);
        return shifts;
      });
      const shifts = (await Promise.all(shiftPromises)).flat();
      return { jobs, shifts, ...campaign };
    }
  );
  const campaignsWithJobsAndShifts = await Promise.all(campaignPromises);
  res.send(campaignsWithJobsAndShifts);
});

export default router;
