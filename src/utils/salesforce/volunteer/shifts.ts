import { fromZonedTime } from "date-fns-tz";

import { VolunteerShift } from "@community-kitchens/apiinterfaces";
import fetcher from "../../fetcher";
import urls from "../../urls";
import { UnformattedShift } from "./types";
import createQuery, { FilterGroup } from "../queryCreator";
import { addDays } from "date-fns";

const formatShift = (
  shift: Pick<
    UnformattedShift,
    | "Id"
    | "GW_Volunteers__Start_Date_Time__c"
    | "GW_Volunteers__Number_of_Volunteers_Still_Needed__c"
    | "Restaurant_Meals__c"
    | "GW_Volunteers__Duration__c"
    | "GW_Volunteers__Desired_Number_of_Volunteers__c"
    | "GW_Volunteers__Job_Location_Street__c"
    | "End_Time__c"
    | "Reserved_Shift_is_Available__c"
    | "GW_Volunteers__Volunteer_Job__c"
  >,
): VolunteerShift => {
  return {
    id: shift.Id,
    startTime: shift.GW_Volunteers__Start_Date_Time__c,
    open:
      shift.GW_Volunteers__Number_of_Volunteers_Still_Needed__c === undefined ||
      shift.GW_Volunteers__Number_of_Volunteers_Still_Needed__c === null ||
      shift.GW_Volunteers__Number_of_Volunteers_Still_Needed__c > 0,
    slots: shift.GW_Volunteers__Number_of_Volunteers_Still_Needed__c || 0,
    job: shift.GW_Volunteers__Volunteer_Job__c,
    restaurantMeals: shift.Restaurant_Meals__c,
    duration: shift.GW_Volunteers__Duration__c,
    totalSlots: shift.GW_Volunteers__Desired_Number_of_Volunteers__c || 0,
    reservedOpen: shift.Reserved_Shift_is_Available__c,
  };
};

export const getShift = async (shiftId: string) => {
  await fetcher.setService("salesforce");

  const url =
    urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Shift__c/" + shiftId;

  const { data }: { data?: UnformattedShift } = await fetcher.get(url);

  if (data) {
    return formatShift(data);
  }
};

export const getShifts = async (jobId: string) => {
  const formattedDaysInAdvance = addDays(new Date(), 60);
  const fields = [
    "Id",
    "GW_Volunteers__Start_Date_Time__c",
    "GW_Volunteers__Number_of_Volunteers_Still_Needed__c",
    "Restaurant_Meals__c",
    "GW_Volunteers__Duration__c",
    "GW_Volunteers__Desired_Number_of_Volunteers__c",
    "GW_Volunteers__Job_Location_Street__c",
    "End_Time__c",
    "Reserved_Shift_is_Available__c",
    "GW_Volunteers__Volunteer_Job__c",
  ] as const;

  const obj = "GW_Volunteers__Volunteer_Shift__c";
  const filters: FilterGroup<UnformattedShift> = {
    AND: [
      { field: "GW_Volunteers__Volunteer_Job__c", value: jobId },
      {
        field: "GW_Volunteers__Start_Date_Time__c",
        operator: ">=",
        value: { date: "TODAY", type: "datestring" },
      },
      {
        field: "GW_Volunteers__Start_Date_Time__c",
        operator: "<=",
        value: { date: formattedDaysInAdvance, type: "datetime" },
      },
      { field: "Restaurant_Meals__c", value: false },
    ],
  };

  const shifts = await createQuery<UnformattedShift, (typeof fields)[number]>({
    fields,
    obj,
    filters,
  });

  const promises = shifts.map(async (js) => {
    const shift = js as unknown as UnformattedShift;
    return formatShift(shift);
  });

  return await Promise.all(promises);
};

export const addSlotToShift = async (
  shift: Pick<VolunteerShift, "id" | "totalSlots">,
  options?: { reservedSlot: boolean },
) => {
  await fetcher.setService("salesforce");
  const url =
    urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Shift__c/" + shift.id;

  const patchData: Pick<
    UnformattedShift,
    | "GW_Volunteers__Desired_Number_of_Volunteers__c"
    | "Reserved_Shift_is_Available__c"
  > = {
    GW_Volunteers__Desired_Number_of_Volunteers__c: shift.totalSlots || 0 + 1,
  };

  if (options?.reservedSlot) {
    patchData.Reserved_Shift_is_Available__c = false;
  }

  await fetcher.patch(url, patchData);
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

  const newShift: Partial<UnformattedShift> = {
    GW_Volunteers__Volunteer_Job__c: jobId,
    Restaurant_Meals__c: restaurantMeals,
    GW_Volunteers__Duration__c: 1,
    GW_Volunteers__Start_Date_Time__c: fromZonedTime(
      date,
      "America/Los_Angeles",
    ).toUTCString(),
    GW_Volunteers__Desired_Number_of_Volunteers__c: 1,
  };

  const response = await fetcher.post(url, newShift);
  return response.data.id;
};
