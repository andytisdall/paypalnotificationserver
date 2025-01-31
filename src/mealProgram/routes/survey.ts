import express from 'express';

import { submitMealSurveyData } from '../../utils/salesforce/SFQuery/mealProgram';

export interface MealSurveyArgs {
  age?: string;
  ethnicity?: string;
  zip?: string;
  microwave?: boolean;
  utensils?: boolean;
  numberOfPeople?: string;
  children?: boolean;
  time?: string;
  mealType?: string;
  mealType2?: string;
  dietary?: string[];
  fruit?: boolean;
  taste?: boolean;
  access?: boolean;
  skip?: string;
}

const router = express.Router();

router.post('/survey', async (req, res) => {
  await submitMealSurveyData(req.body as MealSurveyArgs);
  res.sendStatus(204);
});

export default router;
