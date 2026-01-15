import { zonedTimeToUtc } from "date-fns-tz";

import fetcher from "../../../fetcher";
import urls from "../../../urls";
import { Shift, FormattedShift } from "./types";
import createQuery, { FilterGroup, QueryFilter } from "../queryCreator";
import { addDays } from "date-fns";

export const getShift = async (
  shiftId: string
): Promise<FormattedShift | undefined> => {
  await fetcher.setService("salesforce");

  const url =
    urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Shift__c/" + shiftId;

  const { data }: { data?: Shift } = await fetcher.get(url);

  if (data) {
    return {
      id: data.Id,
      startTime: data.GW_Volunteers__Start_Date_Time__c,
      open:
        data.GW_Volunteers__Number_of_Volunteers_Still_Needed__c === null ||
        data.GW_Volunteers__Number_of_Volunteers_Still_Needed__c > 0,
      slots: data.GW_Volunteers__Number_of_Volunteers_Still_Needed__c || 0,
      job: data.GW_Volunteers__Volunteer_Job__c,
      restaurantMeals: data.Restaurant_Meals__c,
      duration: data.GW_Volunteers__Duration__c,
      totalSlots: data.GW_Volunteers__Desired_Number_of_Volunteers__c || 0,
    };
  }
};

export const getShifts = async (
  jobId: string,
  daysInAdvance: number = 60
): Promise<FormattedShift[]> => {
  const formattedDaysInAdvance = addDays(new Date(), daysInAdvance);

  const fields = [
    "Id",
    "GW_Volunteers__Start_Date_Time__c",
    "GW_Volunteers__Number_of_Volunteers_Still_Needed__c",
    "Restaurant_Meals__c",
    "GW_Volunteers__Duration__c",
    "GW_Volunteers__Desired_Number_of_Volunteers__c",
    "GW_Volunteers__Job_Location_Street__c",
    "End_Time__c",
  ] as const;

  const obj = "GW_Volunteers__Volunteer_Shift__c";
  const filters: FilterGroup<Shift> = {
    AND: [
      { field: "GW_Volunteers__Volunteer_Job__c", value: jobId },
      {
        field: "GW_Volunteers__Start_Date_Time__c",
        operator: ">=",
        value: { date: new Date(), type: "datetime" },
      },
      {
        field: "GW_Volunteers__Start_Date_Time__c",
        operator: "<=",
        value: { date: formattedDaysInAdvance, type: "datetime" },
      },
    ],
  };

  const shifts = await createQuery<Shift, (typeof fields)[number]>({
    fields,
    obj,
    filters,
  });

  const promises = shifts.map(async (js) => {
    return {
      id: js.Id,
      startTime: js.GW_Volunteers__Start_Date_Time__c,
      open:
        js.GW_Volunteers__Number_of_Volunteers_Still_Needed__c === null ||
        js.GW_Volunteers__Number_of_Volunteers_Still_Needed__c > 0,
      slots: js.GW_Volunteers__Number_of_Volunteers_Still_Needed__c,
      job: jobId,
      restaurantMeals: js.Restaurant_Meals__c,
      duration: js.GW_Volunteers__Duration__c,
      totalSlots: js.GW_Volunteers__Desired_Number_of_Volunteers__c,
    };
  });

  return await Promise.all(promises);
};

export const addSlotToShift = async (shift: FormattedShift) => {
  await fetcher.setService("salesforce");
  const url =
    urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Shift__c/" + shift.id;

  await fetcher.patch(url, {
    GW_Volunteers__Desired_Number_of_Volunteers__c: shift.totalSlots + 1,
  });
};

export const createShift = async ({
  jobId,
  restaurantMeals,
  date,
}: {
  jobId: string;
  date: string;
  restaurantMeals?: boolean;
}): Promise<string> => {
  await fetcher.setService("salesforce");
  const url = urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Shift__c";

  const newShift: Partial<Shift> = {
    GW_Volunteers__Volunteer_Job__c: jobId,
    Restaurant_Meals__c: restaurantMeals,
    GW_Volunteers__Duration__c: 1,
    GW_Volunteers__Start_Date_Time__c: zonedTimeToUtc(
      date,
      "America/Los_Angeles"
    ).toUTCString(),
    GW_Volunteers__Desired_Number_of_Volunteers__c: 1,
  };

  const response = await fetcher.post(url, newShift);
  return response.data.id;
};
