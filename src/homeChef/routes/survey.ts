import express from "express";

import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { createHomeChefSurvey } from "../../utils/salesforce/SFQuery/volunteer/homeChef";

const router = express.Router();

export interface Times {
  "9": boolean;
  "2": boolean;
  "4": boolean;
}

export interface Days {
  sun: Times;
  mon: Times;
  tues: Times;
  wed: Times;
  thurs: Times;
}

export interface Items {
  "Grains (rice, pasta)": boolean;
  "Legumes (beans, lentils)": boolean;
  "Animal protein (chicken, beef)": boolean;
  "Non-animal protein (tofu, seitan)": boolean;
  Cheese: boolean;
  Eggs: boolean;
}

export interface SurveyArgs {
  times: Days;
  more?: "dates" | "items";
  items: Items;
  otherTime: string;
  otherItem: string;
}

router.post("/survey", currentUser, requireAuth, async (req, res) => {
  const { times, more, items, otherItem, otherTime }: SurveyArgs = req.body;

  const contactId = req.currentUser!.salesforceId;

  await createHomeChefSurvey({
    times,
    more,
    items,
    contactId,
    otherTime,
    otherItem,
  });

  res.send(null);
});

export default router;
