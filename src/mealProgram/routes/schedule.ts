import express from 'express';

import {
  getMealProgramSchedule,
  getRestaurantMealProgramSchedule,
} from '../../utils/salesforce/SFQuery/mealProgram';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';

const router = express.Router();

router.get(
  '/schedule',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const deliveries = await getMealProgramSchedule();
    res.send(deliveries);
  }
);

router.get('/schedule/:id', currentUser, requireAuth, async (req, res) => {
  const id: string = req.params.id;
  const deliveries = await getRestaurantMealProgramSchedule(id);
  res.send(deliveries);
});

export default router;
