import express from "express";

import { MealSurveyArgs } from "../../utils/salesforce/mealProgram/types";
import { submitMealSurveyData } from "../../utils/salesforce/mealProgram/survey";

const router = express.Router();

router.post("/survey", async (req, res) => {
  await submitMealSurveyData(req.body as MealSurveyArgs);
  res.sendStatus(204);
});

export default router;
