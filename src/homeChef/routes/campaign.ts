import express from "express";

import { getHomeChefCampaign } from "../../utils/salesforce/SFQuery/volunteer/campaign/campaign";

const router = express.Router();

// campaign route is public so ckoakland volunteer page
// can display current number of meals donated

router.get("/campaign", async (req, res) => {
  const { Total_Meals_Donated__c } = await getHomeChefCampaign();

  res.send({
    mealsDonated: Total_Meals_Donated__c,
  });
});

export default router;
