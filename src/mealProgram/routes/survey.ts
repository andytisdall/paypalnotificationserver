import express from 'express';

import { submitMealSurveyData } from '../../utils/salesforce/SFQuery/mealProgram';

export interface MealSurveyArgs {
  microwave?: boolean;
  heatFood?: boolean;
  utensils?: boolean;
  numberOfPeople?: string;
  children?: boolean;
  time: string[];
  mealType: string[];
  dietary: string[];
  protein: string[];
  fruit?: boolean;
  salad?: boolean;
  taste?: boolean;
  access?: boolean;
  skip?: boolean;
}

const router = express.Router();

router.post('/survey', async (req, res) => {
  await submitMealSurveyData(req.body);
  res.sendStatus(204);
});

export default router;
