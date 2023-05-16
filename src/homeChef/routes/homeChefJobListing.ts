import express from 'express';
import moment from 'moment';
import { decode } from 'html-entities';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import urls from '../../utils/urls';
import fetcher from '../../utils/fetcher';

const router = express.Router();

export interface Shift {
  Id: string;
  GW_Volunteers__Start_Date_Time__c: string;
  GW_Volunteers__Number_of_Volunteers_Still_Needed__c: number;
}

export interface FormattedShift {
  id: string;
  startTime: string;
  open: boolean;
  job: string;
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
}

router.get(
  '/job-listing/feed-the-hood',
  currentUser,
  requireAuth,
  async (req, res) => {
    await fetcher.setService('salesforce');
    const jobs = await getJobs(urls.feedTheHoodCampaignId);
    const shiftPromises = jobs.map(async (j) => {
      const shifts = await getShifts(j.id);
      j.shifts = shifts.map((sh) => sh.id);
      return shifts;
    });
    const shifts = (await Promise.all(shiftPromises)).flat();
    res.send({ jobs, shifts });
  }
);

router.get('/job-listing', currentUser, requireAuth, async (req, res) => {
  await fetcher.setService('salesforce');

  const jobs = await getJobs(urls.townFridgeCampaignId);
  // const shifts: FormattedShift[] = [];
  const shiftPromises = jobs.map(async (j) => {
    const jobShifts = await getShifts(j.id);
    const jobShiftsExcludingMonday = jobShifts.filter(
      (js) => moment(js.startTime, 'YYYY-MM-DD').format('d') !== '1'
    );
    j.shifts = jobShiftsExcludingMonday.map((js) => js.id);
    return jobShiftsExcludingMonday;
  });
  const shifts = (await Promise.all(shiftPromises)).flat();
  res.send({ jobs, shifts });
});

const getJobs = async (id: string): Promise<FormattedJob[]> => {
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
        j.GW_Volunteers__Description__c?.replace(/<p>/g, '')
          .replace(/<\/p>/g, '')
          .replace(/<br>/g, '')
      ),
    };
  });
};

const getShifts = async (id: string): Promise<FormattedShift[]> => {
  const sixtyDaysFromNow = moment().add(60, 'days').format();

  const query = `SELECT Id, GW_Volunteers__Start_Date_Time__c, GW_Volunteers__Number_of_Volunteers_Still_Needed__c from GW_Volunteers__Volunteer_Shift__c WHERE GW_Volunteers__Volunteer_Job__c = '${id}' AND GW_Volunteers__Start_Date_time__c >= TODAY AND  GW_Volunteers__Start_Date_time__c <= ${sixtyDaysFromNow}`;

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
      startTime: moment(
        js.GW_Volunteers__Start_Date_Time__c,
        'YYYY-MM-DDTHH:mm:ssZ'
      ).format('YYYY-MM-DD'),
      open: js.GW_Volunteers__Number_of_Volunteers_Still_Needed__c > 0,
      job: id,
    };
  });
};

export default router;
