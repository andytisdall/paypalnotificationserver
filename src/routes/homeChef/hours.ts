import express from 'express';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import fetcher from '../../services/fetcher';
import urls from '../../services/urls';

const router = express.Router();

interface HoursQueryResponse {
  data:
    | {
        records: {
          Name: string;
          Number_of_Meals__c: number;
          GW_Volunteers__Shift_Start_Date_Time__c: string;
          GW_Volunteers__Volunteer_Job__c: string;
          GW_Volunteers__Status__c: string;
        }[];
      }
    | undefined;
}

router.get('/hours', currentUser, requireAuth, async (req, res) => {
  await fetcher.setService('salesforce');
  const id = req.currentUser?.salesforceId;
  const query = `SELECT Name, GW_Volunteers__Status__c, Number_of_Meals__c, GW_Volunteers__Shift_Start_Date_Time__c, GW_Volunteers__Volunteer_Job__c from GW_Volunteers__Volunteer_Hours__c WHERE GW_Volunteers__Contact__c = '${id}'`;

  const hoursQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const response: HoursQueryResponse = await fetcher.instance.get(
    hoursQueryUri
  );
  if (!response.data?.records) {
    throw Error('Could not query volunteer hours');
  }
  const hours = response.data.records.map((h) => {
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

export default router;
