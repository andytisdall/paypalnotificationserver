import express from 'express';

import urls from '../../services/urls';
import fetcher from '../../services/fetcher';

const router = express.Router();

router.post('/meal-survey', async (req, res) => {
  const { mealName, location, taste, size, type, ingredients, days, phone } =
    req.body;

  await fetcher.setService('salesforce');

  const surveyData = {
    Meal_Name__c: mealName,
    Location__c: location,
    Meal_Taste__c: taste,
    Meal_Size__c: size,
    Desired_Meal_Type__c: type,
    Desired_Ingredients__c: ingredients,
    Days_of_Use_Per_Week__c: days,
    Phone_Number__c: phone,
  };

  const insertUri = urls.SFOperationPrefix + '/Meal_Survey_Data__c';
  const { data } = await fetcher.post(insertUri, surveyData);

  if (!data.success) {
    throw new Error('Could not save the survey results');
  }
  res.sendStatus(200);
});

router.post('/signup-survey', async (req, res) => {
  const { age, ethnicity, zip, type, ingredients, days, phone, calfresh } =
    req.body;

  await fetcher.setService('salesforce');
  const clientData = {
    Age__c: age,
    Ethnicity__c: ethnicity,
    Zip_Code__c: zip,
    Phone_Number__c: phone,
  };

  const surveyData = {
    Desired_Meal_Type__c: type,
    Desired_Ingredients__c: ingredients,
    Days_of_Use_Per_Week__c: days,
    Phone_Number__c: phone,
    Interest_in_Calfresh__c: calfresh,
  };

  const CDInsertUri = urls.SFOperationPrefix + '/Client_Data__c';
  const CDRes = await fetcher.post(CDInsertUri, clientData);

  if (!CDRes.data.success) {
    throw new Error('Could not save the survey results');
  }

  const MSInsertUri = urls.SFOperationPrefix + '/Meal_Survey_Data__c';
  const MSRes = await fetcher.post(MSInsertUri, surveyData);

  if (!MSRes.data.success) {
    throw new Error('Could not save the survey results');
  }

  res.sendStatus(200);
});

export default router;
