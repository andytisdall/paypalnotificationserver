import express from 'express';

import { getMealProgramSchedule } from '../../utils/salesforce/SFQuery';

const router = express.Router();

router.get('/schedule', async (req, res) => {
  const deliveries = await getMealProgramSchedule();
  res.send(deliveries);
});

export default router;
