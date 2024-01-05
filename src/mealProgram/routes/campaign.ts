import express from 'express';

import {
  getMealProgramData,
  getHomeChefCampaign,
} from '../../utils/salesforce/SFQuery/campaign';

const router = express.Router();

const PAST_YEARS_MEAL_TOTAL = 193131;

router.get('/campaign', async (req, res) => {
  const salesforceTotal = await getMealProgramData();
  const { Total_Meals_Donated__c } = await getHomeChefCampaign();
  res.send({
    total: salesforceTotal + PAST_YEARS_MEAL_TOTAL + Total_Meals_Donated__c,
  });
});

export default router;
