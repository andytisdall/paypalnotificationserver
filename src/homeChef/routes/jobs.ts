import express from "express";
import { format } from "date-fns";

import { getJobs } from "../../utils/salesforce/volunteer/jobs";
import urls from "../../utils/urls";
import { getShifts } from "../../utils/salesforce/volunteer/shifts";
import { requireAuth } from "../../middlewares/require-auth";

const router = express.Router();

router.get("/job-listing", requireAuth, async (req, res) => {
  const jobs = await getJobs(urls.townFridgeCampaignId);

  const shiftPromises = jobs.map(async (j) => {
    const jobShifts = (await getShifts(j.id)).map((js) => {
      return {
        ...js,
        startTime: format(js.startTime, "yyyy-MM-dd"),
      };
    });

    j.shifts = jobShifts;
    return jobShifts;
  });
  const shifts = (await Promise.all(shiftPromises)).flat();
  const mappedJobs = jobs.map((j) => {
    return { ...j, shifts: j.shifts.map((sh) => sh.id) };
  });
  res.send({ jobs: mappedJobs, shifts });
});

export default router;
