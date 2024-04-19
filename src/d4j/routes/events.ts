import express from 'express';

import { getD4JEvents } from '../../utils/salesforce/SFQuery/d4j';

const router = express.Router();

router.get('/events', async (req, res) => {
  const events = await getD4JEvents();

  res.send(events);
});

export default router;
