import express from 'express';

import { getMealProgramData } from '../../utils/salesforce/SFQuery/campaign';

const router = express.Router();

const PAST_YEARS_MEAL_TOTAL = 193131;

router.get('/campaign', async (req, res) => {
  const salesforceTotal = await getMealProgramData();
  res.send({ total: salesforceTotal + PAST_YEARS_MEAL_TOTAL });
});

export default router;
