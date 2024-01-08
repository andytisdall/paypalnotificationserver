import express from 'express';
import { format } from 'date-fns';

import { getD4JEvents } from '../utils/salesforce/SFQuery/d4j';

const router = express.Router();

interface D4jEvent {
  name: string;
  description: string;
  id: string;
  startDate: string;
  endDate?: string;
  photo?: string;
  url?: string;
  time?: string;
}

router.get('/events', async (req, res) => {
  // const events = await getD4JEvents();
  const EVENTS: D4jEvent[] = [
    {
      name: 'Oakland Restaurant Week',
      id: '1234',
      startDate: '2024-03-14',
      endDate: '2024-03-24',
      photo:
        'https://storage.googleapis.com/coherent-vision-368820.appspot.com/orw-24-photo.png',
      url: 'https://www.visitoakland.com/events/annual-events/restaurant-week/',
      description: `At Feed the Hood 27 on Dec. 9th East Oakland Collective will be delivering 1,500 bagged lunches, water, snack and supply kits to our unhoused brothers and sisters throughout Oakland.

      Community Kitchens will be preparing Chef Kendall's famous macaroni salad and sliced fruit to add a bit of extra love to each lunch bag and we can use your help packaging and slicing fruit!`,
    },
  ];
  res.send(EVENTS);
});

export default router;
