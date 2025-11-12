import express from "express";

import {
  deleteSurveyData,
  getOldSurveyData,
  submitMealSurveyData,
  submitSNAPSurveyData,
} from "../../utils/salesforce/SFQuery/mealProgram";
import { requireAdmin } from "../../middlewares/require-admin";
import { requireAuth } from "../../middlewares/require-auth";
import { currentUser } from "../../middlewares/current-user";

export interface MealSurveyArgs {
  language: "English" | "Spanish";
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
  fridge?: boolean;
  diabetes?: boolean;
  hbp?: boolean;
}

const router = express.Router();

router.post("/survey", async (req, res) => {
  await submitMealSurveyData(req.body as MealSurveyArgs);
  res.sendStatus(204);
});

// one time survey migration
// router.post(
//   "/survey/migrate",
//   currentUser,
//   requireAuth,
//   requireAdmin,
//   async (req, res) => {
//     await deleteSurveyData();
//     const oldSurveyData = await getOldSurveyData();
//     const promises = oldSurveyData.map((data) =>
//       submitMealSurveyData({
//         language: "English",
//         age: data.Age__c === "27-50" ? "27-49" : data.Age__c,
//         ethnicity:
//           data.Ethnicity__c && !ethnicities.includes(data.Ethnicity__c)
//             ? "Other"
//             : data.Ethnicity__c,
//         zip: data.Zip_Code__c,
//       })
//     );
//     const recordsCreated = await Promise.all(promises);

//     res.send({ records: recordsCreated.length });
//   }
// );

// const ethnicities = [
//   "African American/Black",
//   "Asian/Pacific Islander",
//   "Latina/Latino",
//   "Native American/American Indian",
//   "White/Caucasian",
// ];

export interface SNAPSurveyArgs {
  receiveSNAP: boolean;
  november?: boolean;
  whatDay?: string;
  howMuch?: string;
  reduce?: boolean;
}

router.post("/survey/snap", async (req, res) => {
  const { receiveSNAP, november, whatDay, howMuch, reduce }: SNAPSurveyArgs =
    req.body;

  await submitSNAPSurveyData({
    receiveSNAP,
    november,
    whatDay,
    howMuch,
    reduce,
  });

  res.send(null);
});

export default router;
