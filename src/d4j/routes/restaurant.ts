import express from 'express';

import { getPlaceDetails } from '../../utils/getPlaceDetails';
import {
  getBars,
  getD4jRestaurants,
  updateDetails,
} from '../../utils/salesforce/SFQuery/account';

const router = express.Router();

router.get('/restaurants', async (req, res) => {
  const restaurants = await getD4jRestaurants();
  const bars = await getBars();
  res.send([...restaurants, ...bars]);
});

router.get('/restaurantDetails/:restaurantId', async (req, res) => {
  const { restaurantId } = req.params;

  try {
    const restaurantDetails = await getPlaceDetails(restaurantId);
    updateDetails(restaurantId, restaurantDetails);
    res.send(restaurantDetails);
  } catch (err) {
    throw Error('Could not get restaurant details. Please try again.');
  }
});

export default router;
