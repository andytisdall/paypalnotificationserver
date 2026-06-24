import express from "express";

import { MealSurveyArgs } from "../../utils/salesforce/mealProgram/oldSurvey";
import { submitMealSurveyData } from "../../utils/salesforce/mealProgram/oldSurvey";
import { submitMealSurveyDataV3 } from "../../utils/salesforce/mealProgram/surveyV3";
import { MealSurveyArgsV3 } from "../../utils/salesforce/mealProgram/types";

const router = express.Router();

router.post("/survey", async (req, res) => {
  await submitMealSurveyData(req.body as MealSurveyArgs);
  res.sendStatus(204);
});

router.post("/survey3", async (req, res) => {
  await submitMealSurveyDataV3(req.body as MealSurveyArgsV3);
  res.sendStatus(204);
});

export default router;
