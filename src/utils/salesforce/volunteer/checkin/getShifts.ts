import urls from "../../../urls";
import createQuery, { FilterGroup } from "../../queryCreator";
import { Shift } from "../types";

interface GetTodaysShiftsResponse {
  jobs: Record<
    string,
    {
      id: string;
      name: string;
      shifts: string[];
    }
  >;
  shifts: Record<
    string,
    {
      id: string;
      jobName: string;
      startTime: string;
      duration: number;
    }
  >;
}

export const getTodaysVolunteerShifts: () => Promise<GetTodaysShiftsResponse> =
  async () => {
    // const campaignFields = ["Id"] as const;
    // const campaignObj = "Campaign";
    // const campaignFilters: FilterGroup<UnformattedVolunteerCampaign> = {
    //   AND: [{ field: "Name", operator: "!=", value: "Delivery Drivers" }],
    // };
    // const campaigns = await createQuery<
    //   UnformattedVolunteerCampaign,
    //   (typeof campaignFields)[number]
    // >({ fields: campaignFields, obj: campaignObj, filters: campaignFilters });

    // const idList = [...campaigns.map(({ Id }) => Id)];

    // const jobFields = ["Id", "Name"] as const;
    // const jobObj = "GW_Volunteers__Volunteer_Job__c";
    // const jobFilters: FilterGroup<Job> = {
    //   AND: [
    //     {
    //       field: "GW_Volunteers__Campaign__c",
    //       operator: "IN",
    //       value: idList,
    //     },
    //   ],
    // };

    // const jobs = await createQuery<Job, (typeof jobFields)[number]>({
    //   fields: jobFields,
    //   filters: jobFilters,
    //   obj: jobObj,
    // });

    const jobShifts: GetTodaysShiftsResponse = { jobs: {}, shifts: {} };

    const fields = [
      "Id",
      "GW_Volunteers__Start_Date_Time__c",
      "GW_Volunteers__Duration__c",
    ] as const;
    const obj = "GW_Volunteers__Volunteer_Shift__c";
    const filters: FilterGroup<Shift> = {
      AND: [
        {
          field: "GW_Volunteers__Start_Date_Time__c",
          value: { date: "TODAY", type: "datestring" },
        },
        {
          field: "GW_Volunteers__Volunteer_Job__r.GW_Volunteers__Campaign__c",
          operator: "!=",
          value: urls.deliveryDriverCampaignId,
        },
        {
          field: "GW_Volunteers__Volunteer_Job__r.GW_Volunteers__Campaign__c",
          operator: "!=",
          value: urls.townFridgeCampaignId,
        },
      ],
    };

    const shifts = await createQuery<Shift, (typeof fields)[number]>({
      fields,
      obj,
      filters,
      join: {
        GW_Volunteers__Volunteer_Job__r: ["Name", "Id"],
      },
    });

    if (shifts.length) {
      shifts?.forEach((shift) => {
        const jobId = shift.GW_Volunteers__Volunteer_Job__r!.Id;
        const jobName = shift.GW_Volunteers__Volunteer_Job__r!.Name;

        jobShifts.shifts[shift.Id] = {
          id: shift.Id,
          jobName,
          startTime: shift.GW_Volunteers__Start_Date_Time__c,
          duration: shift.GW_Volunteers__Duration__c,
        };

        if (!jobShifts.jobs[jobId]) {
          jobShifts.jobs[jobId] = {
            id: jobId,
            name: jobName,
            shifts: [shift.Id],
          };
        } else {
          jobShifts.jobs[jobId].shifts.push(shift.Id);
        }
      });
    }

    return jobShifts;
  };
