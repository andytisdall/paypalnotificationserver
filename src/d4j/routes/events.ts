import express from 'express';

import { getD4JCampaigns } from '../../utils/salesforce/SFQuery/campaign';

const router = express.Router();

const COCKTAIL_PARTICIPANT_IDS = ['0018Z00003E88yMQAR', '001UP000002xIMLYA2'];

router.get('/events', async (req, res) => {
  const events = await getD4JCampaigns();

  res.send(events);
});

router.get('/events/cocktail-competition', async (req, res) => {
  res.send(COCKTAIL_PARTICIPANT_IDS);
});

export default router;
