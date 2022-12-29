const express = require('express');

const { Restaurant } = require('../models/restaurant');
const { User } = require('../models/user');
const { currentUser } = require('../middlewares/current-user.js');
const { requireAuth } = require('../middlewares/require-auth');
const { requireAdmin } = require('../middlewares/require-admin');

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
    if (restaurant.user !== req.currentUser && !req.currentUser.admin) {
      return res.sendStatus(403);
    }
    return res.send(restaurant);
  }
);

router.get('/restaurants', currentUser, requireAuth, requireAdmin, async (req, res) => {
  const restaurants = await Restaurant.find();
  res.send(restaurants)
})

module.exports = router;
