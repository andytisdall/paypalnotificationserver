import express from "express";
import { getDay, addDays, getHours } from "date-fns";
import { toZonedTime } from "date-fns-tz";

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
  const isMealPrep = jobId === urls.ckKitchenMealPrepJobId;

  let daysInAdvance = isMealPrep ? 90 : 52;
  let shifts = await getShifts(jobId, daysInAdvance);

  if (isMealPrep) {
    shifts = shifts.filter((sh) => {
      const shiftDateTime = toZonedTime(sh.startTime, "America/Los_Angeles");
      const day = getDay(shiftDateTime);
      const hour = getHours(shiftDateTime);

      const holdDateForGroups = hour < 17 && ![0, 4, 5].includes(day);

      if (holdDateForGroups) {
        return shiftDateTime < addDays(new Date(), 60);
      }
      return true;
    });
  }

  return shifts;
};

export default router;
