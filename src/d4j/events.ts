import express from 'express';

import { getD4JEvents } from '../utils/salesforce/SFQuery/d4j';

const router = express.Router();

router.get('/events', async (req, res) => {
  // const events = await getD4JEvents();
  const EVENTS = [
    {
      name: 'Sample Event',
      id: '1234',
      date: '2023-12-25',
    },
  ];
  res.send(EVENTS);
});

export default router;
