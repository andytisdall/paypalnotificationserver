import express from "express";

import {
  getHours,
  getHour,
} from "../../../utils/salesforce/SFQuery/volunteer/hours";

const router = express.Router();

router.get("/hours/:campaignId/:contactId?", async (req, res) => {
  const campaignId = req.params.campaignId;
  const contactId = req.params.contactId;
  if (!contactId) {
    return res.sendStatus(204);
  }
  const shortenedCampaignId = campaignId.substring(0, campaignId.length - 3);
  const hours = await getHours(shortenedCampaignId, contactId);
  res.send(hours);
});

router.get("/hour/:hoursId", async (req, res) => {
  const { hoursId } = req.params;
  const hour = await getHour(hoursId);
  res.send(hour);
});

export default router;
