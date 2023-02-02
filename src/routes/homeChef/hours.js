const express = require('express');
const axios = require('axios');

const { currentUser } = require('../../middlewares/current-user');
const { requireAuth } = require('../../middlewares/require-auth');
const urls = require('../../services/urls');
const getSFToken = require('../../services/salesforce/getSFToken');

const router = express.Router();

const axiosInstance = axios.create({
  baseURL: urls.salesforce,
});

router.get('/hours', currentUser, requireAuth, async (req, res) => {
  const token = await getSFToken();
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

  const id = req.currentUser.salesforceId;
  const query = `SELECT Name, GW_Volunteers__Status__c, Number_of_Meals__c, GW_Volunteers__Shift_Start_Date_Time__c, GW_Volunteers__Volunteer_Job__c from GW_Volunteers__Volunteer_Hours__c WHERE GW_Volunteers__Contact__c = '${id}'`;

  const hoursQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const { data } = await axiosInstance.get(hoursQueryUri);
  const hours = data.records.map((h) => {
    return {
      id: h.Name,
      mealCount: h.Number_of_Meals__c,
      time: h.GW_Volunteers__Shift_Start_Date_Time__c,
      job: h.GW_Volunteers__Volunteer_Job__c,
      status: h.GW_Volunteers__Status__c,
    };
  });
  res.send(hours);
});

module.exports = router;
