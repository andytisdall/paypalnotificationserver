import express from 'express';

import { getD4jRestaurants } from '../utils/salesforce/SFQuery/account';

const router = express.Router();

router.get('/restaurants', async (req, res) => {
  console.log('route');
  const restaurants = await getD4jRestaurants();
  res.send(restaurants);
});

export default router;
