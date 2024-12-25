import express from 'express';

import { updateCampaignMember } from '../../utils/salesforce/SFQuery/volunteer/campaign/campaignMember';

const router = express.Router();

router.post('/events/rsvp', async (req, res) => {
  const {
    attending,
    guest,
    email,
    campaignId,
  }: {
    attending: boolean;
    guest: boolean;
    email: string;
    campaignId: string;
  } = req.body;

  await updateCampaignMember({
    response: { attending, guest },
    email,
    campaignId,
  });

  res.sendStatus(204);
});

export default router;
