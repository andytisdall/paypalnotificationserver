import express from "express";

import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import urls from "../../utils/urls";
import fetcher from "../../utils/fetcher";
import { getJobs } from "../../utils/salesforce/volunteer/jobs";

const router = express.Router();

router.get("/fridges", requireAuth, async (req, res) => {
  // this router gets the fridges for text app purposes
  // no texts for some fridges

  const jobs = await getJobs(urls.townFridgeCampaignId, true);
  res.send(jobs);
});

export default router;
