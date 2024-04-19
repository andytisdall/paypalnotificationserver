import express from 'express';

import { getD4JCampaigns } from '../../utils/salesforce/SFQuery/campaign';

const router = express.Router();

router.get('/events', async (req, res) => {
  const events = await getD4JCampaigns();

  res.send(events);
});

export default router;
