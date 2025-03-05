import express from "express";

import {
  NewMobileOasisDelivery,
  createScheduledDelivery,
} from "../../utils/salesforce/SFQuery/mealProgram";
import { currentUser } from "../../middlewares/current-user";
import { requireTextPermission } from "../../middlewares/require-text-permission";
import { createHours } from "../../utils/salesforce/SFQuery/volunteer/hours";
import { createShift } from "../../utils/salesforce/SFQuery/volunteer/shifts";

const router = express.Router();

router.post("/", currentUser, requireTextPermission, async (req, res) => {
  const body: NewMobileOasisDelivery = req.body;
  await createScheduledDelivery(body);

  // create home chef restaurant meals delivery

  const shiftId = await createShift(body.fridge);
  // const newHours = {
  //   contactId: req.currentUser?.salesforceId!,
  //   shiftId: shiftId,
  //   jobId: body.fridge,
  //   date: new Date().toISOString(),
  //   mealCount: body.numberOfMealsMeat + body.numberOfMealsVeg,
  //   restaurantMeals: true,
  // };
  // await createHours(newHours);

  res.sendStatus(204);
});

export default router;
