import express from "express";
import { getDay, addDays } from "date-fns";
import utcToZonedTime from "date-fns-tz/utcToZonedTime";

import urls from "../../utils/urls";
import { getShifts } from "../../utils/salesforce/SFQuery/volunteer/shifts";
import { getJobs } from "../../utils/salesforce/SFQuery/volunteer/jobs";

const router = express.Router();

router.get("/jobs/:campaignId", async (req, res) => {
  const { campaignId } = req.params;
  const jobs = await getJobs(campaignId);
  const promises = jobs.map(async (j) => {
    j.shifts = await getJobShifts(j.id);
    return j;
  });

  const jobsWithShifts = await Promise.all(promises);

  res.send(jobsWithShifts);
});

const getJobShifts = async (jobId: string) => {
  let daysInAdvance = 42;

  if (jobId === urls.ckKitchenMealPrepJobId) {
    return (await getShifts(jobId, 90)).filter((sh) => {
      const day = getDay(utcToZonedTime(sh.startTime, "America/Los_Angeles"));
      if (![0, 5].includes(day)) {
        return (
          utcToZonedTime(sh.startTime, "America/Los_Angeles") <
          addDays(new Date(), 30)
        );
      }
      return true;
    });
  } else {
    return await getShifts(jobId, daysInAdvance);
  }
};

export default router;
