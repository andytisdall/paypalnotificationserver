const express = require('express');
const axios = require('axios');
const moment = require('moment');
const { decode } = require('html-entities');

const { currentUser } = require('../../middlewares/current-user.js');
const { requireAuth } = require('../../middlewares/require-auth');
const getSFToken = require('../../services/salesforce/getSFToken');
const urls = require('../../services/urls');
const createHours = require('./createHours');
const { sendShiftSignupEmail } = require('../../services/email');

const router = express.Router();

const axiosInstance = axios.create({ baseURL: urls.salesforce });

router.get('/job-listing', currentUser, requireAuth, async (req, res) => {
  const token = await getSFToken();
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

  const jobs = await getJobs(urls.townFridgeCampaignId, axiosInstance);
  const renamedJobs = jobs.map((j) => {
    // rename attributes to something sane
    return {
      id: j.Id,
      name: j.Name,
      shifts: [],
      location: decode(
        j.GW_Volunteers__Location_Information__c?.replace('<p>', '').replace(
          '</p>',
          ''
        )
      ),
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
          open: js.GW_Volunteers__Number_of_Volunteers_Still_Needed__c > 0,
          job: j.id,
        };
      })
    );
  });
  await Promise.all(shiftPromises);
  res.send({ jobs: renamedJobs, shifts });
});

router.post('/job-listing', currentUser, requireAuth, async (req, res) => {
  const { mealCount, shiftId, jobId, date } = req.body;
  const { salesforceId } = req.currentUser;
  const chef = await createHours({
    contactId: salesforceId,
    mealCount,
    shiftId,
    jobId,
    date,
  });

  await sendShiftSignupEmail(chef.Email);

  res.send(shiftId);
});

const getJobs = async (id, axiosInstance) => {
  const query = `SELECT Id, Name, GW_Volunteers__Location_Information__c	 from GW_Volunteers__Volunteer_Job__c WHERE GW_Volunteers__Campaign__c = '${id}'`;

  const jobQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const res = await axiosInstance.get(jobQueryUri);
  return res.data.records;
};

const getShifts = async (id, axiosInstance) => {
  const ThirtyDaysFromNow = moment().add(30, 'day').format();

  const query = `SELECT Id, GW_Volunteers__Start_Date_Time__c, GW_Volunteers__Number_of_Volunteers_Still_Needed__c from GW_Volunteers__Volunteer_Shift__c WHERE GW_Volunteers__Volunteer_Job__c = '${id}' AND GW_Volunteers__Start_Date_time__c >= TODAY AND  GW_Volunteers__Start_Date_time__c <= ${ThirtyDaysFromNow}`;

  const shiftQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const res = await axiosInstance.get(shiftQueryUri);
  return res.data.records;
};

module.exports = router;
