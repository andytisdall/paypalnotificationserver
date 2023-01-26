const express = require('express');
const axios = require('axios');
const moment = require('moment');

const { currentUser } = require('../../middlewares/current-user.js');
const { requireAuth } = require('../../middlewares/require-auth');
const getSFToken = require('../../services/salesforce/getSFToken');
const urls = require('../../services/urls');

const router = express.Router();

const axiosInstance = axios.create({ baseURL: urls.salesforce });

router.get('/job-listing', currentUser, requireAuth, async (req, res) => {
  const token = await getSFToken();
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

  const CKHomeChefCampaignId =
    process.env.NODE_ENV === 'production'
      ? '7018Z000003C3MxQAK'
      : '7018G000000JSCWQA4';
  const jobs = await getJobs(CKHomeChefCampaignId, axiosInstance);
  const renamedJobs = jobs.map((j) => {
    // rename attributes to something sane
    return {
      id: j.Id,
      name: j.Name,
      shifts: [],
      location: j.GW_Volunteers__Location_Information__c.replace(
        '<p>',
        ''
      ).replace('</p>', ''),
    };
  });
  const shifts = [];
  const shiftPromises = renamedJobs.map(async (j) => {
    const jobShifts = await getShifts(j.id, axiosInstance);
    shifts.push(
      ...jobShifts.map((js) => {
        // rename attributes to something sane
        j.shifts.push(js.Id);
        return {
          id: js.Id,
          startTime: js.GW_Volunteers__Start_Date_Time__c,
        };
      })
    );
  });
  await Promise.all(shiftPromises);
  res.send({ jobs: renamedJobs, shifts });
});

const getJobs = async (id, axiosInstance) => {
  const query = `SELECT Id, Name, GW_Volunteers__Location_Information__c	 from GW_Volunteers__Volunteer_Job__c WHERE GW_Volunteers__Campaign__c = '${id}'`;

  const jobQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const res = await axiosInstance.get(jobQueryUri);
  return res.data.records;
};

const getShifts = async (id, axiosInstance) => {
  const ThirtyDaysFromNow = moment().add(30, 'day').format();

  const query = `SELECT Id, GW_Volunteers__Start_Date_Time__c from GW_Volunteers__Volunteer_Shift__c WHERE GW_Volunteers__Volunteer_Job__c = '${id}' AND GW_Volunteers__Start_Date_time__c >= TODAY AND  GW_Volunteers__Start_Date_time__c <= ${ThirtyDaysFromNow}`;

  const shiftQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const res = await axiosInstance.get(shiftQueryUri);
  return res.data.records;
};

module.exports = router;
