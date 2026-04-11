import express from "express";

import { getVolunteerCampaigns } from "../../utils/salesforce/volunteer/campaign/campaign";

const router = express.Router();

router.get("/campaigns", async (req, res) => {
  const campaigns = await getVolunteerCampaigns();

  res.send(campaigns);
});

export default router;
