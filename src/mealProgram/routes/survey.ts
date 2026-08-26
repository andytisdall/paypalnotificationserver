import express from "express";
import { MealSurveyArgsV3 } from "@community-kitchens/apiinterfaces";
import { submitMealSurveyDataV3 } from "../../utils/salesforce/mealProgram/surveyV3";

const router = express.Router();

router.post("/survey", async (req, res) => {
  await submitMealSurveyDataV3(req.body as MealSurveyArgsV3["formData"]);
  res.sendStatus(204);
});

export default router;
