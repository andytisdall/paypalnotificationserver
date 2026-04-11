import createQuery, { FilterGroup } from "../../queryCreator";
import { Job, Shift } from "../types";
import { UnformattedVolunteerCampaign } from "../campaign/types";

export const getTodaysVolunteerShifts = async () => {
  const campaignFields = ["Id"] as const;
  const campaignObj = "Campaign";
  const campaignFilters: FilterGroup<UnformattedVolunteerCampaign> = {
    AND: [
      { field: "Portal_Signups_Enabled__c", value: true },
      { field: "Name", operator: "!=", value: "Delivery Drivers" },
    ],
  };
  const campaigns = await createQuery<
    UnformattedVolunteerCampaign,
    (typeof campaignFields)[number]
  >({ fields: campaignFields, obj: campaignObj, filters: campaignFilters });

  const idList = [...campaigns.map(({ Id }) => Id)];

  const jobFields = ["Id", "Name"] as const;
  const jobObj = "GW_Volunteers__Volunteer_Job__c";
  const jobFilters: FilterGroup<Job> = {
    AND: [
      {
        field: "GW_Volunteers__Campaign__c",
        operator: "IN",
        value: idList,
      },
    ],
  };

  const jobs = await createQuery<Job, (typeof jobFields)[number]>({
    fields: jobFields,
    filters: jobFilters,
    obj: jobObj,
  });

  const jobShifts: {
    jobs: Record<string, { id: string; name: string; shifts: string[] }>;
    shifts: Record<
      string,
      { id: string; jobName: string; startTime: string; duration: number }
    >;
  } = { jobs: {}, shifts: {} };

  const shiftPromises = jobs.map(async (job) => {
    const fields = [
      "Id",
      "GW_Volunteers__Start_Date_Time__c",
      "GW_Volunteers__Duration__c",
    ] as const;
    const obj = "GW_Volunteers__Volunteer_Shift__c";
    const filters: FilterGroup<Shift> = {
      AND: [
        { field: "GW_Volunteers__Volunteer_Job__c", value: job.Id },
        {
          field: "GW_Volunteers__Start_Date_Time__c",
          value: { date: "TODAY", type: "datestring" },
        },
      ],
    };

    const shifts = await createQuery<Shift, (typeof fields)[number]>({
      fields,
      obj,
      filters,
    });

    if (shifts.length) {
      shifts?.forEach((shift) => {
        jobShifts.shifts[shift.Id] = {
          id: shift.Id,
          jobName: job.Name,
          startTime: shift.GW_Volunteers__Start_Date_Time__c,
          duration: shift.GW_Volunteers__Duration__c,
        };
      });

      jobShifts.jobs[job.Id] = {
        id: job.Id,
        name: job.Name,
        shifts: shifts.map(({ Id }) => Id),
      };
    }
  });

  await Promise.all(shiftPromises);

  return jobShifts;
};
