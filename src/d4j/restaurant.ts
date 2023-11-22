import express from 'express';

import { getD4jRestaurants } from '../utils/salesforce/SFQuery/account';
import { getD4JVisits } from '../utils/salesforce/SFQuery/d4j';

const router = express.Router();

router.get('/restaurants', async (req, res) => {
  const restaurants = await getD4jRestaurants();
  res.send(restaurants);
});

router.get('/visits/:id', async (req, res) => {
  const { id } = req.params;
  const visits = await getD4JVisits(id);
  res.send(visits);
});

export default router;
