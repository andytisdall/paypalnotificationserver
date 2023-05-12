import express from 'express';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import fetcher from '../../utils/fetcher';
import urls from '../../utils/urls';
import { getContactById } from '../../utils/salesforce/SFQuery';
import { sendShiftEditEmail } from '../../utils/email';

const router = express.Router();

const SOUP_PRICE = 6;
const ENTREE_PRICE = 11;

interface SFInsertResponse {
  data:
    | {
        success: boolean;
        id: string;
      }
    | undefined;
}
interface Hours {
  Id: string;
  Number_of_Meals__c?: number;
  GW_Volunteers__Shift_Start_Date_Time__c: string;
  GW_Volunteers__Volunteer_Job__c: string;
  GW_Volunteers__Volunteer_Shift__c: string;
  GW_Volunteers__Status__c: string;
}

interface HoursQueryResponse {
  data:
    | {
        records: Hours[];
      }
    | undefined;
}

export interface FormattedHours {
  id: string;
  mealCount: string;
  time: string;
  job: string;
  status: string;
  shift: string;
}

interface CreateHoursParams {
  contactId: string;
  shiftId: string;
  mealCount: number;
  jobId: string;
  date: string;
  soup: boolean;
}

router.get('/hours', currentUser, requireAuth, async (req, res) => {
  await fetcher.setService('salesforce');
  const id = req.currentUser?.salesforceId;
  const query = `SELECT Id, GW_Volunteers__Status__c, Number_of_Meals__c, GW_Volunteers__Shift_Start_Date_Time__c, GW_Volunteers__Volunteer_Job__c, GW_Volunteers__Volunteer_Shift__c from GW_Volunteers__Volunteer_Hours__c WHERE GW_Volunteers__Contact__c = '${id}' AND (GW_Volunteers__Status__c = 'Confirmed' OR GW_Volunteers__Status__c = 'Completed')`;

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
      shift: h.GW_Volunteers__Volunteer_Shift__c,
    };
  });
  res.send(hours);
});

interface HoursPostParams {
  mealCount: number;
  shiftId: string;
  jobId: string;
  date: string;
  soup: boolean;
}

router.post('/hours', currentUser, requireAuth, async (req, res) => {
  const { mealCount, shiftId, jobId, date, soup }: HoursPostParams = req.body;
  const salesforceId = req.currentUser!.salesforceId;
  if (!salesforceId) {
    throw Error('User does not have a salesforce ID');
  }
  const hours = await createHours({
    contactId: salesforceId,
    mealCount,
    shiftId,
    jobId,
    date,
    soup,
  });

  res.status(201);
  res.send(hours);
});

router.patch('/hours/:id', currentUser, requireAuth, async (req, res) => {
  const { id } = req.params;
  const {
    mealCount,
    cancel,
    completed,
    soup,
    emailData,
  }: {
    mealCount: number;
    cancel: boolean;
    completed: boolean;
    soup: boolean;
    emailData: { fridge: string; date: string };
  } = req.body;

  await fetcher.setService('salesforce');

  interface updateHours {
    Number_of_Meals__c: number;
    Type_of_Meal__c: string;
    GW_Volunteers__Status__c?: string;
  }

  const hoursToUpdate: updateHours = {
    Number_of_Meals__c: mealCount,
    Type_of_Meal__c: soup ? 'Soup' : 'Entree',
  };

  if (cancel) {
    hoursToUpdate.GW_Volunteers__Status__c = 'Canceled';
  }

  const hoursUpdateUri =
    urls.SFOperationPrefix + '/GW_Volunteers__Volunteer_Hours__c/' + id;
  await fetcher.patch(hoursUpdateUri, hoursToUpdate);

  // update the opportunity linked to the vol hours
  // opp is updated by a salesforce flow

  //email
  // get user email, date of shift, and fridge name
  const { Email } = await getContactById(req.currentUser!.salesforceId);
  // email user confirmation
  await sendShiftEditEmail(Email, {
    date: emailData.date,
    fridge: emailData.fridge,
    cancel,
    mealCount,
  });

  res.send({ id, mealCount });
});

const createHours = async ({
  contactId,
  shiftId,
  mealCount,
  jobId,
  date,
  soup,
}: CreateHoursParams): Promise<FormattedHours> => {
  await fetcher.setService('salesforce');
  const { data } = await fetcher.get(
    urls.SFOperationPrefix + '/GW_Volunteers__Volunteer_Shift__c/' + shiftId
  );
  if (data.GW_Volunteers__Number_of_Volunteers_Still_Needed__c === 0) {
    throw new Error('This shift has no available slots');
  }
  const mealType = soup ? 'Soup' : 'Entree';
  const hoursToAdd = {
    GW_Volunteers__Contact__c: contactId,
    GW_Volunteers__Volunteer_Shift__c: shiftId,
    GW_Volunteers__Status__c: 'Confirmed',
    Number_of_Meals__c: mealCount,
    GW_Volunteers__Volunteer_Job__c: jobId,
    GW_Volunteers__Start_Date__c: date,
    Type_of_Meal__c: mealType,
  };

  const hoursInsertUri =
    urls.SFOperationPrefix + '/GW_Volunteers__Volunteer_Hours__c';
  const insertRes: SFInsertResponse = await fetcher.post(
    hoursInsertUri,
    hoursToAdd
  );

  if (!insertRes.data?.success) {
    throw new Error('Unable to insert hours!');
  }
  const res: { data: Hours | undefined } = await fetcher.get(
    urls.SFOperationPrefix +
      '/GW_Volunteers__Volunteer_Hours__c/' +
      insertRes.data.id
  );
  if (!res.data) {
    throw Error('Could not get newly created volunteer hours');
  }
  return {
    id: res.data.Id,
    mealCount: res.data.Number_of_Meals__c?.toString() || '0',
    shift: res.data.GW_Volunteers__Volunteer_Shift__c,
    job: res.data.GW_Volunteers__Volunteer_Job__c,
    time: res.data.GW_Volunteers__Shift_Start_Date_Time__c,
    status: res.data.GW_Volunteers__Status__c,
  };
};

// const editOpp = async (
//   id: string,
//   cancel: boolean,
//   mealCount: number,
//   soup: boolean
// ) => {
//   const query = `SELECT Id FROM Opportunity WHERE Volunteer_Hours__c = '${id}'`;
//   const giftQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

//   const { data }: { data: { records: { Id: string }[] } } = await fetcher.get(
//     giftQueryUri
//   );
//   // don't crash if opp is not found
//   if (data.records?.length) {
//     const giftUpdateUri =
//       urls.SFOperationPrefix + '/Opportunity/' + data.records[0].Id;
//     if (cancel) {
//       // delete opp
//       await fetcher.delete(giftUpdateUri);
//     } else {
//       // patch opp with new deets: meals * 11 for amount, etc etc
//       const mealPrice = soup ? SOUP_PRICE : ENTREE_PRICE;
//       const newAmount = mealCount * mealPrice;
//       await fetcher.patch(giftUpdateUri, { amount: newAmount });
//     }
//   }
// };

export default router;
