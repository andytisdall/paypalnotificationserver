import express from 'express';
import mongodb from 'mongodb';
import mongoose from 'mongoose';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';

const User = mongoose.model('User');
const Restaurant = mongoose.model('Restaurant');
const router = express.Router();

router.post(
  '/restaurant',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { name, userId, salesforceId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found!');
    }
    const newRestaurant = new Restaurant({ name, user, salesforceId });
    await newRestaurant.save();
    res.status(201).send(newRestaurant);
  }
);

router.get('/restaurant', currentUser, requireAuth, async (req, res) => {
  const restaurant = await Restaurant.findOne({ user: req.currentUser });
  if (!restaurant) {
    return res.sendStatus(404);
  }
  return res.send(restaurant);
});

router.get(
  '/restaurant/:restaurantId',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.sendStatus(404);
    }
    if (
      restaurant.user !== new mongodb.ObjectId(req.currentUser!.id) &&
      !req.currentUser!.admin
    ) {
      return res.sendStatus(403);
    }
    return res.send(restaurant);
  }
);

router.get(
  '/restaurants',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const restaurants = await Restaurant.find();
    res.send(restaurants);
  }
);

router.patch(
  '/restaurant',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { restaurantId, name, salesforceId, userId } = req.body;

    const rest = await Restaurant.findById(restaurantId);
    if (!rest) {
      throw Error('Restaurant not found');
    }
    if (name) {
      rest.name = name;
    }
    if (salesforceId) {
      rest.salesforceId = salesforceId;
    }
    if (userId) {
      rest.user = userId;
    }
    await rest.save();
    res.send(rest);
  }
);

export default router;