import express from 'express';
import mongodb from 'mongodb';
import mongoose from 'mongoose';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';
import {
  restaurantFileInfo,
  RestaurantDocType,
} from '../../files/uploadFilesToSalesforce';
import { getAccountById } from '../../utils/salesforce/SFQuery';

const User = mongoose.model('User');
const Restaurant = mongoose.model('Restaurant');
const router = express.Router();

router.post('/', currentUser, requireAuth, requireAdmin, async (req, res) => {
  const {
    name,
    userId,
    salesforceId,
  }: { name: string; userId: string; salesforceId: string } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found!');
  }
  const newRestaurant = new Restaurant({ name, user, salesforceId });
  await newRestaurant.save();
  res.status(201).send(newRestaurant);
});

router.get('/', currentUser, requireAuth, async (req, res) => {
  const restaurant = await Restaurant.findOne({ user: req.currentUser!.id });
  if (!restaurant) {
    return res.sendStatus(200);
  }
  const account = await getAccountById(restaurant.salesforceId);

  const onboardingDocs = account.Meal_Program_Onboarding__c;
  const completedDocs = onboardingDocs ? onboardingDocs.split(';') : [];
  const docTypes = Object.keys(restaurantFileInfo) as RestaurantDocType[];
  const remainingDocs = docTypes
    .map((d) => {
      return { docType: d, ...restaurantFileInfo[d] };
    })
    .filter((d) => !completedDocs.includes(d.title));

  return res.send({
    name: restaurant.name,
    id: restaurant._id,
    salesforceId: restaurant.salesforceId,
    remainingDocs,
    completedDocs,
  });
});

router.get('/all', currentUser, requireAuth, requireAdmin, async (req, res) => {
  const restaurants = await Restaurant.find();
  res.send(restaurants);
});

router.get(
  '/:restaurantId',
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

router.patch('/', currentUser, requireAuth, requireAdmin, async (req, res) => {
  const {
    restaurantId,
    name,
    salesforceId,
    userId,
  }: {
    restaurantId: string;
    name: string;
    salesforceId: string;
    userId: string;
  } = req.body;

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
});

router.delete(
  '/:id',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const id: string = req.params.id;
    await Restaurant.deleteOne({ _id: id });
    res.send(id);
  }
);

export default router;
