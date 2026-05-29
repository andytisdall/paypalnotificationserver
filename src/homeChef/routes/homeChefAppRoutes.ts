import express from "express";

import { requireAuth } from "../../middlewares/require-auth";
import urls from "../../utils/urls";
import { getJobs } from "../../utils/salesforce/volunteer/jobs";

const router = express.Router();

router.get("/fridges", requireAuth, async (req, res) => {
  // deprecated route for home chef app

  const jobs = await getJobs(urls.townFridgeCampaignId);
  res.send(jobs);
});

export default router;
