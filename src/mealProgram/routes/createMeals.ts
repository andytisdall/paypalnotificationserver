import express from 'express';

import {
  NewMobileOasisDelivery,
  createScheduledDelivery,
} from '../../utils/salesforce/SFQuery/mealProgram';
import { currentUser } from '../../middlewares/current-user';
import { requireTextPermission } from '../../middlewares/require-text-permission';

const router = express.Router();

router.post('/', currentUser, requireTextPermission, async (req, res) => {
  const body: NewMobileOasisDelivery = req.body;
  await createScheduledDelivery(body);
  res.sendStatus(204);
});

export default router;
