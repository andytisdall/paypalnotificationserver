const express = require('express');
const axios = require('axios');

const getToken = require('../../services/salesforce/getSFToken');
const urls = require('../../services/urls');

const axiosInstance = axios.create({
  baseURL: urls.salesforce,
});

const router = express.Router();

router.post('/meal-survey', async (req, res) => {
  const { mealName, location, taste, size, type, ingredients, days, phone } =
    req.body;

  const token = await getToken();
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

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
  const { data } = await axiosInstance.post(insertUri, surveyData);

  if (!data.success) {
    throw new Error('Could not save the survey results');
  }
  res.sendStatus(200);
});

router.post('/signup-survey', async (req, res) => {
  const { age, ethnicity, zip, type, ingredients, days, phone } = req.body;

  const token = await getToken();
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

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
  };

  const CDInsertUri = urls.SFOperationPrefix + '/Client_Data__c';
  const { CDData } = await axiosInstance.post(CDInsertUri, clientData);

  if (!CDData.success) {
    throw new Error('Could not save the survey results');
  }

  const MSInsertUri = urls.SFOperationPrefix + '/Meal_Survey_Data__c';
  const { MSData } = await axiosInstance.post(MSInsertUri, surveyData);

  if (!MSData.success) {
    throw new Error('Could not save the survey results');
  }

  res.sendStatus(200);
});

module.exports = router;
