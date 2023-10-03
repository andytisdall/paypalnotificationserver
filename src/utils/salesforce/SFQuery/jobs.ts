import { decode } from 'html-entities';
import moment from 'moment';

import fetcher from '../../fetcher';
import urls from '../../urls';

export interface Shift {
  Id: string;
  GW_Volunteers__Start_Date_Time__c: string;
  GW_Volunteers__Number_of_Volunteers_Still_Needed__c: number;
  Restaurant_Meals__c: boolean;
  GW_Volunteers__Duration__c: number;
}

export interface FormattedShift {
  id: string;
  startTime: string;
  open: boolean;
  job: string;
  restaurantMeals: boolean;
  duration: number;
  slots: number;
}

export interface Job {
  Id: string;
  Name: string;
  GW_Volunteers__Inactive__c: boolean;
  GW_Volunteers__Ongoing__c: boolean;
  GW_Volunteers__Description__c: string;
  GW_Volunteers__Location_Street__c: string;
}

export interface FormattedJob {
  id: string;
  name: string;
  location: string;
  shifts: string[];
  active: boolean;
  ongoing: boolean;
  description: string;
  campaign: string;
}

export const getJobs = async (id: string): Promise<FormattedJob[]> => {
  const query = `SELECT Id, Name, GW_Volunteers__Inactive__c, GW_Volunteers__Location_Street__c, GW_Volunteers__Description__c, GW_Volunteers__Ongoing__c from GW_Volunteers__Volunteer_Job__c WHERE GW_Volunteers__Campaign__c = '${id}'`;

  const jobQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const res: { data: { records: Job[] | undefined } } = await fetcher.get(
    jobQueryUri
  );
  if (!res.data.records) {
    throw Error('failed querying volunteer Jobs');
  }
  return res.data.records.map((j: Job) => {
    // rename attributes to something sane
    return {
      id: j.Id,
      name: j.Name,
      shifts: [],
      active: !j.GW_Volunteers__Inactive__c,
      ongoing: j.GW_Volunteers__Ongoing__c,
      location: j.GW_Volunteers__Location_Street__c,
      description: decode(
        j.GW_Volunteers__Description__c?.replace(/\<[^<>]*\>/g, '')
      ),
      campaign: id,
    };
  });
};

export const getShifts = async (jobId: string): Promise<FormattedShift[]> => {
  const sixtyDaysFromNow = moment().add(60, 'days').format();

  const query = `SELECT Id, GW_Volunteers__Start_Date_Time__c, GW_Volunteers__Number_of_Volunteers_Still_Needed__c, Restaurant_Meals__c, GW_Volunteers__Duration__c from GW_Volunteers__Volunteer_Shift__c WHERE GW_Volunteers__Volunteer_Job__c = '${jobId}' AND GW_Volunteers__Start_Date_time__c >= TODAY AND  GW_Volunteers__Start_Date_time__c <= ${sixtyDaysFromNow}`;

  const shiftQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const res: {
    data: { records: Shift[] | undefined };
  } = await fetcher.instance.get(shiftQueryUri);
  if (!res.data.records) {
    throw Error('Failed querying volunteer shifts');
  }
  return res.data.records.map((js) => {
    return {
      id: js.Id,
      startTime: js.GW_Volunteers__Start_Date_Time__c,
      open: js.GW_Volunteers__Number_of_Volunteers_Still_Needed__c > 0,
      slots: js.GW_Volunteers__Number_of_Volunteers_Still_Needed__c,
      job: jobId,
      restaurantMeals: js.Restaurant_Meals__c,
      duration: js.GW_Volunteers__Duration__c,
    };
  });
};
