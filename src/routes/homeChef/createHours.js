const axios = require('axios');

const getSFToken = require('../../services/salesforce/getSFToken');
const urls = require('../../services/urls');

const axiosInstance = axios.create({
  baseURL: urls.salesforce,
});

const createHours = async ({ contactId, shiftId, mealCount, jobId, date }) => {
  const hoursToAdd = {
    GW_Volunteers__Contact__c: contactId,
    GW_Volunteers__Volunteer_Shift__c: shiftId,
    GW_Volunteers__Status__c: 'Confirmed',
    // Number_of_Meals__c: mealCount,
    GW_Volunteers__Volunteer_Job__c: jobId,
    GW_Volunteers__Start_Date__c: date,
  };
  const token = await getSFToken();
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

  const hoursInsertUri =
    urls.SFOperationPrefix + '/GW_Volunteers__Volunteer_Hours__c';
  const insertRes = await axiosInstance.post(hoursInsertUri, hoursToAdd);
  //Query new contact to get household account number for opp
  if (insertRes.data.success) {
    return insertRes.data;
  } else {
    throw new Error('Unable to insert hours!');
  }
};
module.exports = createHours;
