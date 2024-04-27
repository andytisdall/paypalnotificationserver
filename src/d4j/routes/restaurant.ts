import express from 'express';

import { getPlaceDetails } from '../../utils/getPlaceDetails';
import {
  getBars,
  getD4jRestaurants,
  updateDetails,
} from '../../utils/salesforce/SFQuery/account';
import { currentD4JUser } from '../../middlewares/current-d4j-user';

const router = express.Router();

router.get('/restaurants', async (req, res) => {
  const restaurants = await getD4jRestaurants();
  const bars = await getBars();
  res.send([...restaurants, ...bars]);
});

router.get('/restaurantDetails/:restaurantId', async (req, res) => {
  const { restaurantId } = req.params; // google ID

  try {
    const restaurantDetails = await getPlaceDetails(restaurantId);
    res.send(restaurantDetails);
  } catch (err) {
    throw Error('Could not get restaurant details. Please try again.');
  }
});

router.patch('/restaurants', currentD4JUser, async (req, res) => {
  const { restaurantId } = req.body;

  if (!req.currentD4JUser) {
    throw Error('No user sign in');
  }
  await updateDetails(restaurantId);
});

export default router;
