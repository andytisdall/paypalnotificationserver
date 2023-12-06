import express from 'express';

import { getPlaceDetails } from '../utils/getPlaceDetails';
import { getD4jRestaurants } from '../utils/salesforce/SFQuery/account';

const router = express.Router();

router.get('/restaurants', async (req, res) => {
  const restaurants = await getD4jRestaurants();
  res.send(restaurants);
});

router.post('/restaurantDetails/', async (req, res) => {
  const { restaurantIds }: { restaurantIds: string[] } = req.body;

  const promises = restaurantIds.map(async (id) => {
    return getPlaceDetails(id);
  });
  const restaurantDetails = await Promise.all(promises);
  res.send(restaurantDetails);
});

export default router;
