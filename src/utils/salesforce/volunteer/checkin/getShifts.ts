import urls from "../../../urls";
import createQuery, { FilterGroup } from "../../queryCreator";
import { UnformattedShift } from "../types";
import { CheckInShiftsResponse } from "@community-kitchens/apiinterfaces";

export const getTodaysVolunteerShifts: () => Promise<CheckInShiftsResponse> =
  async () => {
    const jobShifts: CheckInShiftsResponse = { jobs: {}, shifts: {} };

    const fields = [
      "Id",
      "GW_Volunteers__Start_Date_Time__c",
      "GW_Volunteers__Duration__c",
    ] as const;
    const obj = "GW_Volunteers__Volunteer_Shift__c";
    const filters: FilterGroup<UnformattedShift> = {
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

    const shifts = await createQuery<UnformattedShift, (typeof fields)[number]>(
      {
        fields,
        obj,
        filters,
        join: {
          GW_Volunteers__Volunteer_Job__r: ["Name", "Id"],
        },
      },
    );

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
