import express from 'express';

import { getPlaceDetails } from '../utils/getPlaceDetails';
import { getD4jRestaurants } from '../utils/salesforce/SFQuery/account';

const router = express.Router();

router.get('/restaurants', async (req, res) => {
  const restaurants = await getD4jRestaurants();
  res.send(restaurants);
});

router.get('/restaurantDetails/:restaurantId', async (req, res) => {
  const { restaurantId } = req.params;

  const restaurantDetails = await getPlaceDetails(restaurantId);
  res.send(restaurantDetails);
});

export default router;
