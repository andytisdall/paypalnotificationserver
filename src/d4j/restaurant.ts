import express from 'express';

import { getPlaceDetails } from '../utils/getPlaceDetails';
import { getD4jRestaurants } from '../utils/salesforce/SFQuery/account';

const router = express.Router();

router.get('/restaurants', async (req, res) => {
  const restaurants = await getD4jRestaurants();
  res.send(restaurants);
});

router.get('/restaurantDetails/:ids', async (req, res) => {
  const ids = req.params.ids.split('@');

  const promises = ids.map(async (id) => {
    return getPlaceDetails(id);
  });
  const restaurantDetails = await Promise.all(promises);
  res.send(restaurantDetails);
});

export default router;
