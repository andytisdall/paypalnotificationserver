import express from 'express';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import fetcher from '../../services/fetcher';
import urls from '../../services/urls';
import { sendShiftSignupEmail } from '../../services/email';

const router = express.Router();

interface HoursQueryResponse {
  data:
    | {
        records: {
          Id: string;
          Number_of_Meals__c?: number;
          GW_Volunteers__Shift_Start_Date_Time__c: string;
          GW_Volunteers__Volunteer_Job__c: string;
          GW_Volunteers__Status__c: string;
        }[];
      }
    | undefined;
}

export interface FormattedHours {
  id: string;
  mealCount: string;
  time: string;
  job: string;
  status: string;
}

router.get('/hours', currentUser, requireAuth, async (req, res) => {
  await fetcher.setService('salesforce');
  const id = req.currentUser?.salesforceId;
  const query = `SELECT Id, GW_Volunteers__Status__c, Number_of_Meals__c, GW_Volunteers__Shift_Start_Date_Time__c, GW_Volunteers__Volunteer_Job__c from GW_Volunteers__Volunteer_Hours__c WHERE GW_Volunteers__Contact__c = '${id}'`;

  const hoursQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const response: HoursQueryResponse = await fetcher.get(hoursQueryUri);
  if (!response.data?.records) {
    throw Error('Could not query volunteer hours');
  }
  const hours: FormattedHours[] = response.data.records.map((h) => {
    let mealCount = h.Number_of_Meals__c;
    if (!mealCount) {
      mealCount = 0;
    }
    return {
      id: h.Id,
      mealCount: mealCount.toString(),
      time: h.GW_Volunteers__Shift_Start_Date_Time__c,
      job: h.GW_Volunteers__Volunteer_Job__c,
      status: h.GW_Volunteers__Status__c,
    };
  });
  res.send(hours);
});

router.post('/hours', currentUser, requireAuth, async (req, res) => {
  const { mealCount, shiftId, jobId, date } = req.body;
  const salesforceId = req.currentUser?.salesforceId;
  if (!salesforceId) {
    throw Error('User does not have a salesforce ID');
  }
  const chef = await createHours({
    contactId: salesforceId,
    mealCount,
    shiftId,
    jobId,
    date,
  });

  await sendShiftSignupEmail(chef.Email);

  res.status(201);
  res.send(shiftId);
});

router.patch('/hours/:id', currentUser, requireAuth, async (req, res) => {
  const { id } = req.params;
  const { mealCount } = req.body;

  await fetcher.setService('salesforce');

  const hoursToUpdate = {
    Number_of_Meals__c: mealCount,
  };

  const hoursUpdateUri =
    urls.SFOperationPrefix + '/GW_Volunteers__Volunteer_Hours__c/' + id;
  await fetcher.patch(hoursUpdateUri, hoursToUpdate);

  res.send({ id, mealCount });
});

interface SFInsertResponse {
  data:
    | {
        success: boolean;
        id: string;
      }
    | undefined;
}

const createHours = async ({
  contactId,
  shiftId,
  mealCount,
  jobId,
  date,
}: {
  contactId: string;
  shiftId: string;
  mealCount: string;
  jobId: string;
  date: Date;
}) => {
  await fetcher.setService('salesforce');
  const { data } = await fetcher.get(
    urls.SFOperationPrefix + '/GW_Volunteers__Volunteer_Shift__c/' + shiftId
  );
  if (data.GW_Volunteers__Number_of_Volunteers_Still_Needed__c === 0) {
    throw new Error('This shift has no available slots');
  }
  const hoursToAdd = {
    GW_Volunteers__Contact__c: contactId,
    GW_Volunteers__Volunteer_Shift__c: shiftId,
    GW_Volunteers__Status__c: 'Confirmed',
    Number_of_Meals__c: mealCount,
    GW_Volunteers__Volunteer_Job__c: jobId,
    GW_Volunteers__Start_Date__c: date,
  };

  const hoursInsertUri =
    urls.SFOperationPrefix + '/GW_Volunteers__Volunteer_Hours__c';
  const insertRes: SFInsertResponse = await fetcher.post(
    hoursInsertUri,
    hoursToAdd
  );
  //Query new contact to get household account number for opp
  if (insertRes.data?.success) {
    const res = await fetcher.get(
      urls.SFOperationPrefix + '/Contact/' + contactId
    );
    return res.data;
  } else {
    throw new Error('Unable to insert hours!');
  }
};

export default router;
