import express from "express";

import fetcher from "../../utils/fetcher";
import { getHours } from "../../utils/salesforce/SFQuery/volunteer/hours";
// import { getRecurringHours } from '../../utils/salesforce/SFQuery/volunteer/ckKitchen';

const router = express.Router();

router.get("/hours/:campaignId/:contactId?", async (req, res) => {
  const campaignId = req.params.campaignId;
  const contactId = req.params.contactId;
  if (!contactId) {
    return res.sendStatus(204);
  }
  await fetcher.setService("salesforce");
  const shortenedCampaignId = campaignId.substring(0, campaignId.length - 3);
  const hours = await getHours(shortenedCampaignId, contactId);
  res.send(hours);
});

// router.get('/recurring-hours', async (req, res) => {
//   const days = await getRecurringHours();
//   res.send(days);
// });

export default router;
