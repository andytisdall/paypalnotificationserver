import express from "express";

import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import urls from "../../utils/urls";
import fetcher from "../../utils/fetcher";
import { getJobs } from "../../utils/salesforce/SFQuery/volunteer/jobs";

const router = express.Router();

router.get("/fridges", currentUser, requireAuth, async (req, res) => {
  // this router gets the fridges for text app purposes
  // fridges without a region are excluded
  await fetcher.setService("salesforce");

  const jobs = await getJobs(urls.townFridgeCampaignId);
  res.send(jobs.filter((j) => j.active && j.id !== urls.barlettTownFridgeId));
});

export default router;
