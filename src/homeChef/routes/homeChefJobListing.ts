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

interface Job {
  Id: string;
  Name: string;
  GW_Volunteers__Location_Information__c: string;
  GW_Volunteers__Inactive__c: boolean;
}

interface FormattedJob {
  id: string;
  name: string;
  location: string;
  shifts: string[];
  active: boolean;
}

router.get('/job-listing', currentUser, requireAuth, async (req, res) => {
  await fetcher.setService('salesforce');

  const jobs = await getJobs(urls.townFridgeCampaignId);
  const renamedJobs: FormattedJob[] = jobs.map((j: Job) => {
    // rename attributes to something sane
    return {
      id: j.Id,
      name: j.Name,
      shifts: [],
      active: !j.GW_Volunteers__Inactive__c,
      location: decode(
        j.GW_Volunteers__Location_Information__c?.replace(/<p>/g, '')
          .replace(/<\/p>/g, '')
          .replace(/<br>/g, '')
      ),
    };
  });
  const shifts: FormattedShift[] = [];
  const shiftPromises = renamedJobs.map(async (j) => {
    const jobShifts = await getShifts(j.id);
    shifts.push(
      ...jobShifts.map((js: Shift) => {
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

const getJobs = async (id: string) => {
  const query = `SELECT Id, Name, GW_Volunteers__Location_Information__c, GW_Volunteers__Inactive__c from GW_Volunteers__Volunteer_Job__c WHERE GW_Volunteers__Campaign__c = '${id}'`;

  const jobQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const res: { data: { records: Job[] | undefined } } = await fetcher.get(
    jobQueryUri
  );
  if (!res.data.records) {
    throw Error('failed querying volunteer Jobs');
  }
  return res.data.records;
};

const getShifts = async (id: string) => {
  const ThirtyDaysFromNow = moment().add(30, 'day').format();

  const query = `SELECT Id, GW_Volunteers__Start_Date_Time__c, GW_Volunteers__Number_of_Volunteers_Still_Needed__c from GW_Volunteers__Volunteer_Shift__c WHERE GW_Volunteers__Volunteer_Job__c = '${id}' AND GW_Volunteers__Start_Date_time__c > TODAY AND  GW_Volunteers__Start_Date_time__c <= ${ThirtyDaysFromNow}`;

  const shiftQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const res: {
    data: { records: Shift[] | undefined };
  } = await fetcher.instance.get(shiftQueryUri);
  if (!res.data.records) {
    throw Error('Failed querying volunteer shifts');
  }
  return res.data.records;
};

export default router;
