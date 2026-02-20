import express from "express";

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
  let shifts = await getShifts(jobId);

  return shifts;
};

export default router;
