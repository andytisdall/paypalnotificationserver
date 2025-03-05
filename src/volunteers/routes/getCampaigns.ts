import express from "express";
import { addDays, getDay } from "date-fns";
import utcToZonedTime from "date-fns-tz/utcToZonedTime";

import fetcher from "../../utils/fetcher";
import {
  getCampaign,
  getVolunteerCampaigns,
} from "../../utils/salesforce/SFQuery/volunteer/campaign/campaign";
import { getJobs } from "../../utils/salesforce/SFQuery/volunteer/jobs";
import { getShifts } from "../../utils/salesforce/SFQuery/volunteer/shifts";
import urls from "../../utils/urls";

const router = express.Router();

router.get("/events", async (req, res) => {
  await fetcher.setService("salesforce");
  const campaigns = await getVolunteerCampaigns();
  const ckKitchenCampaign = await getCampaign(urls.ckKitchenCampaignId);
  const campaignPromises = campaigns.map(
    async (campaign) => {
      const jobs = await getJobs(campaign.id);
      const shiftPromises = jobs.map(async (j) => {
        const shifts = await getShifts(j.id, 42);
        j.shifts = shifts.map((sh) => sh.id);
        return shifts;
      });
      const shifts = (await Promise.all(shiftPromises)).flat();
      return { jobs, shifts, ...campaign };
    }
  );

  const kitchenJobs = await getJobs(ckKitchenCampaign.id);
  const shiftPromises = kitchenJobs.map(async (j) => {
    const shifts =  (await getShifts(j.id, 90)).filter(sh => {
      const day = getDay(utcToZonedTime(sh.startTime, 'America/Los_Angeles'))
      if (![0,5].includes(day)) {
        return utcToZonedTime(sh.startTime, 'America/Los_Angeles') < addDays(new Date(), 30)
      }
      return true
    })
    j.shifts = shifts.map((sh) => sh.id);
    return shifts;
  });

  const shifts = (await Promise.all(shiftPromises)).flat();
  const kitchenPromises = {jobs: kitchenJobs, shifts, ...ckKitchenCampaign}

  const campaignsWithJobsAndShifts = await Promise.all([...campaignPromises,kitchenPromises ]);
  res.send(campaignsWithJobsAndShifts);
});

export default router;
