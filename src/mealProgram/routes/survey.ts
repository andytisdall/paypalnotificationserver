import express from "express";

import { MealSurveyArgs } from "../../utils/salesforce/mealProgram/oldSurvey";
import { submitMealSurveyDataV3 } from "../../utils/salesforce/mealProgram/surveyV3";
import { MealSurveyArgsV3 } from "../../utils/salesforce/mealProgram/types";

const router = express.Router();

router.post("/survey", async (req, res) => {
  await submitMealSurveyDataV3(req.body as MealSurveyArgsV3);
  res.sendStatus(204);
});

export default router;
