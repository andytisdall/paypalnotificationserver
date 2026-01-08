import express from "express";

import { getFilesForCampaign } from "../../utils/salesforce/SFQuery/files/getFiles";
import { getVolunteerCampaigns } from "../../utils/salesforce/SFQuery/volunteer/campaign/campaign";

const router = express.Router();

router.get("/campaigns", async (req, res) => {
  const campaigns = await getVolunteerCampaigns();

  res.send(campaigns);
});

// router.get("/campaigns/:campaignId/photos", async (req, res) => {
//   const { campaignId } = req.params;
//   const photos = await getFilesForCampaign(campaignId);

//   res.send(photos);
// });

export default router;
