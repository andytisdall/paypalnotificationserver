import express from "express";

import {
  getHomeChefCampaign,
  getVolunteerCampaigns,
} from "../../utils/salesforce/volunteer/campaign/campaign";

const router = express.Router();

router.get("/campaigns", async (req, res) => {
  const campaigns = await getVolunteerCampaigns();

  res.send(campaigns);
});

router.get("/campaigns/hours", async (req, res) => {
  const campaigns = await getVolunteerCampaigns();
  const homeChef = await getHomeChefCampaign();
  const totalHours = Math.floor(
    campaigns.reduce((prev, cur) => {
      return prev + (cur.totalHours || 0);
    }, 0) + (homeChef.GW_Volunteers__Volunteer_Completed_Hours__c || 0),
  );

  res.send({ totalHours });
});

export default router;
