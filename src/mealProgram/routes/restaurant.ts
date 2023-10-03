import express from 'express';
import mongodb from 'mongodb';
import mongoose from 'mongoose';
import moment from 'moment';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';
import {
  restaurantFileInfo,
  RestaurantDocType,
} from '../../files/salesforce/metadata';
import { getAccountById } from '../../utils/salesforce/SFQuery/account';

const User = mongoose.model('User');
const Restaurant = mongoose.model('Restaurant');
const router = express.Router();

router.post(
  '/restaurant',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
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
  }
);

router.get('/restaurant', currentUser, async (req, res) => {
  // fail silently so users don't get an error on home page
  if (!req.currentUser) {
    return res.sendStatus(204);
  }
  const restaurant = await Restaurant.findOne({ user: req.currentUser!.id });
  if (!restaurant) {
    return res.sendStatus(204);
  }
  res.send(restaurant);
});

router.get(
  '/restaurant/meal-program-info',
  currentUser,
  requireAuth,
  async (req, res) => {
    const restaurant = await Restaurant.findOne({ user: req.currentUser!.id });
    if (!restaurant) {
      throw Error('No restaurant found');
    }
    const account = await getAccountById(restaurant.salesforceId);

    const onboardingDocs = account.Meal_Program_Onboarding__c;
    let completedDocs = onboardingDocs ? onboardingDocs.split(';') : [];
    const docTypes = Object.keys(restaurantFileInfo) as RestaurantDocType[];

    const healthPermitExpired =
      account.Health_Department_Expiration_Date__c &&
      moment(account.Health_Department_Expiration_Date__c).format() <
        moment().format();

    if (healthPermitExpired) {
      completedDocs = completedDocs.filter(
        (d) => d !== restaurantFileInfo.HD.title
      );
    }

    const remainingDocs = docTypes
      .map((d) => {
        return { docType: d, ...restaurantFileInfo[d] };
      })
      .filter((d) => !completedDocs.includes(d.title));

    return res.send({
      remainingDocs,
      completedDocs,
      status: account.Meal_Program_Status__c,
      healthPermitExpired,
    });
  }
);

router.get(
  '/restaurant/all',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const restaurants = await Restaurant.find();
    res.send(restaurants);
  }
);

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

router.patch(
  '/restaurant',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
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
  }
);

router.delete(
  '/restaurant/:id',
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
