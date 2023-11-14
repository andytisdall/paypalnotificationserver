import fetcher from '../../fetcher';
import urls from '../../urls';
import { InsertSuccessResponse } from './reusableTypes';

interface CreateHoursParams {
  contactId: string;
  shiftId: string;
  jobId: string;
  date: string;
  soup?: boolean;
  mealCount?: number;
}

export interface FormattedHours {
  id: string;
  mealCount: string;
  time: string;
  job: string;
  status: string;
  shift: string;
  campaign?: string;
}

interface UnformattedHours {
  GW_Volunteers__Volunteer_Job__c: string;
  GW_Volunteers__Volunteer_Shift__c: string;
  GW_Volunteers__Status__c: string;
  Id?: string;
  Number_of_Meals__c?: number;
  GW_Volunteers__Shift_Start_Date_Time__c?: string;
  Type_of_Meal__c?: string;
  GW_Volunteers__Contact__c?: string;
  GW_Volunteers__Start_Date__c?: string;
}

export interface HoursQueryResponse {
  data:
    | {
        records: UnformattedHours[];
      }
    | undefined;
}

export const createHours = async ({
  contactId,
  shiftId,
  jobId,
  date,
  soup,
  mealCount,
}: CreateHoursParams): Promise<FormattedHours> => {
  await fetcher.setService('salesforce');
  const { data } = await fetcher.get(
    urls.SFOperationPrefix + '/GW_Volunteers__Volunteer_Shift__c/' + shiftId
  );
  if (data.GW_Volunteers__Number_of_Volunteers_Still_Needed__c === 0) {
    throw new Error('This shift has no available slots');
  }

  const hoursToAdd: UnformattedHours = {
    GW_Volunteers__Contact__c: contactId,
    GW_Volunteers__Volunteer_Shift__c: shiftId,
    GW_Volunteers__Status__c: 'Confirmed',
    GW_Volunteers__Volunteer_Job__c: jobId,
    GW_Volunteers__Start_Date__c: date,
  };

  if (mealCount) {
    const mealType = soup ? 'Soup' : 'Entree';
    hoursToAdd.Type_of_Meal__c = mealType;
    hoursToAdd.Number_of_Meals__c = mealCount;
  }

  const hoursInsertUri =
    urls.SFOperationPrefix + '/GW_Volunteers__Volunteer_Hours__c';
  const insertRes: { data: InsertSuccessResponse } = await fetcher.post(
    hoursInsertUri,
    hoursToAdd
  );

  if (!insertRes.data?.success) {
    throw new Error('Unable to insert hours!');
  }
  const res: { data: UnformattedHours | undefined } = await fetcher.get(
    urls.SFOperationPrefix +
      '/GW_Volunteers__Volunteer_Hours__c/' +
      insertRes.data.id
  );
  if (!res.data) {
    throw Error('Could not get newly created volunteer hours');
  }
  return {
    id: res.data.Id!,
    mealCount: res.data.Number_of_Meals__c?.toString() || '0',
    shift: res.data.GW_Volunteers__Volunteer_Shift__c,
    job: res.data.GW_Volunteers__Volunteer_Job__c,
    time: res.data.GW_Volunteers__Shift_Start_Date_Time__c!,
    status: res.data.GW_Volunteers__Status__c,
  };
};

export const getHours = async (campaignId: string, contactId: string) => {
  const query = `SELECT Id, GW_Volunteers__Status__c, Number_of_Meals__c, GW_Volunteers__Shift_Start_Date_Time__c, GW_Volunteers__Volunteer_Job__c, GW_Volunteers__Volunteer_Shift__c from GW_Volunteers__Volunteer_Hours__c WHERE GW_Volunteers__Volunteer_Campaign__c = '${campaignId}' AND GW_Volunteers__Contact__c = '${contactId}'`;

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
      id: h.Id!,
      mealCount: mealCount.toString(),
      time: h.GW_Volunteers__Shift_Start_Date_Time__c!,
      job: h.GW_Volunteers__Volunteer_Job__c,
      status: h.GW_Volunteers__Status__c,
      shift: h.GW_Volunteers__Volunteer_Shift__c,
      campaign: campaignId,
    };
  });
  return hours;
};

export const editHours = async (
  mealCount: number,
  soup: boolean,
  cancel: boolean,
  id: string
) => {
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
};

export const deleteKitchenHours = async (id: string) => {
  await fetcher.setService('salesforce');

  const hoursToUpdate = { GW_Volunteers__Status__c: 'Canceled' };

  const hoursUpdateUri =
    urls.SFOperationPrefix + '/GW_Volunteers__Volunteer_Hours__c/' + id;
  await fetcher.patch(hoursUpdateUri, hoursToUpdate);
};
