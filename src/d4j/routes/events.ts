import express from 'express';
import { format } from 'date-fns';

import { getD4JEvents } from '../../utils/salesforce/SFQuery/d4j';

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
      description: `Eat. Drink. Stay. Repeat. From neighborhood gems and food trucks to MICHELIN rated restaurants, explore The Town’s global culinary offerings during the 10 days of Oakland Restaurant Week 2024. Participating restaurants will offer specially created lunch and dinner menus to showcase the diverse culture and cuisine of our incredibly dynamic city.

      The community and fabric of Oakland is made up of culturally-distinct neighborhoods, inspiring an incredibly creative food scene of unexpected pairings and fusion-style flavors. Favorite foodie hot-spots include Jack London Square and Temescal to Uptown and Fruitvale, to name a few. Plan a visit March 14-24, 2024 and taste what makes Oakland so delicious!`,
    },
  ];
  res.send(EVENTS);
});

export default router;
