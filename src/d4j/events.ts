import express from 'express';
import { format } from 'date-fns';

import { getD4JEvents } from '../utils/salesforce/SFQuery/d4j';

const router = express.Router();

router.get('/events', async (req, res) => {
  // const events = await getD4JEvents();
  const EVENTS = [
    {
      name: 'Feed the Hood',
      id: '1234',
      date: format(new Date(), 'yyyy-MM-dd'),
      photo:
        'https://content.sfstandard.com/wp-content/uploads/2023/02/CK-Mobile-at-EOC_FTH-2500x1875.jpg',
      time: '3pm',
      url: 'https://portal.ckoakland.org',
    },
  ];
  res.send(EVENTS);
});

export default router;
