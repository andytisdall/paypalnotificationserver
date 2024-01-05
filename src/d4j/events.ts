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
      description: `At Feed the Hood 27 on Dec. 9th East Oakland Collective will be delivering 1,500 bagged lunches, water, snack and supply kits to our unhoused brothers and sisters throughout Oakland.

      Community Kitchens will be preparing Chef Kendall's famous macaroni salad and sliced fruit to add a bit of extra love to each lunch bag and we can use your help packaging and slicing fruit!`,
    },
  ];
  res.send(EVENTS);
});

export default router;
