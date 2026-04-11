import express from "express";
import { toZonedTime } from "date-fns-tz";

import { createScheduledDelivery } from "../../utils/salesforce/mealProgram/createDelivery";
import { NewMobileOasisDelivery } from "../../utils/salesforce/mealProgram/types";
import { currentUser } from "../../middlewares/current-user";
import { requireTextPermission } from "../../middlewares/require-text-permission";
import { createHours } from "../../utils/salesforce/volunteer/hours";
import { createShift } from "../../utils/salesforce/volunteer/shifts";

const router = express.Router();

router.post("/", currentUser, requireTextPermission, async (req, res) => {
  const body: NewMobileOasisDelivery = req.body;
  await createScheduledDelivery(body);

  // create home chef restaurant meals delivery

  const shiftId = await createShift({
    jobId: body.fridge,
    date: new Date().toISOString(),
    restaurantMeals: true,
  });
  const newHours = {
    contactId: req.currentUser?.salesforceId!,
    shiftId: shiftId,
    jobId: body.fridge,
    date: toZonedTime(new Date(), "America/Los_Angeles").toISOString(),
    mealCount: body.numberOfMealsMeat + body.numberOfMealsVeg,
    restaurantMeals: true,
  };
  await createHours(newHours);

  res.sendStatus(204);
});

export default router;
