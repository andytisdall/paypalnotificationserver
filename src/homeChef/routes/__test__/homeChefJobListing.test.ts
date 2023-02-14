import app from '../../../../index';
import request from 'supertest';

import urls from '../../../services/urls';
import fetcher from '../../../services/fetcher';
import { Shift } from '../homeChefJobListing';

it('gets the job listings', async () => {
  const token = await global.getToken({ admin: false });
  const res = await request(app)
    .get('/api/home-chef/job-listing')
    .set('Authorization', token)
    .expect(200);

  expect(res.body.jobs.length).not.toEqual(0);
  expect(res.body.shifts).not.toEqual(0);
});

it('signs up for a job shift', async () => {
  const token = await global.getToken({ admin: false });
  await fetcher.setService('salesforce');

  const jobQuery = `SELECT Id from GW_Volunteers__Volunteer_Job__c WHERE GW_Volunteers__Campaign__c = '${urls.townFridgeCampaignId}'`;
  const jobQueryRes = await fetcher.instance.get(
    urls.SFQueryPrefix + encodeURIComponent(jobQuery)
  );
  const jobId = jobQueryRes.data.records[0].Id;
  const shiftQuery = `SELECT Id, GW_Volunteers__Start_Date_Time__c, GW_Volunteers__Number_of_Volunteers_Still_Needed__c from GW_Volunteers__Volunteer_Shift__c WHERE GW_Volunteers__Volunteer_Job__c = '${jobId}'`;
  const shiftQueryRes = await fetcher.instance.get(
    urls.SFQueryPrefix + encodeURIComponent(shiftQuery)
  );
  const shifts: Shift[] = shiftQueryRes.data.records;
  const shift = shifts.find(
    (sh) => sh.GW_Volunteers__Number_of_Volunteers_Still_Needed__c > 0
  );
  if (!shift) {
    throw Error();
  }
  const date = shift.GW_Volunteers__Start_Date_Time__c;

  const res = await request(app)
    .post('/api/home-chef/hours')
    .set('Authorization', token)
    .send({
      mealCount: '25',
      shiftId: shift.Id,
      jobId,
      date,
    })
    .expect(201);
});
