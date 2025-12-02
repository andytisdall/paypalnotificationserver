import fetcher from "../../../fetcher";
import urls from "../../../urls";
import { InsertSuccessResponse } from "./../reusableTypes";
import {
  CreateHoursParams,
  FormattedHours,
  UnformattedHours,
  HoursQueryResponse,
} from "./types";

export const createHours = async ({
  contactId,
  shiftId,
  jobId,
  date,
  soup,
  mealCount,
  numberOfVolunteers,
  restaurantMeals,
}: CreateHoursParams): Promise<FormattedHours> => {
  await fetcher.setService("salesforce");
  const { data } = await fetcher.get(
    urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Shift__c/" + shiftId
  );
  // getting this error
  if (data.GW_Volunteers__Number_of_Volunteers_Still_Needed__c === 0) {
    console.log(data);
    console.log("Contact trying to book is " + contactId);
    throw new Error("This shift has no available slots");
  }

  const hoursToAdd: Partial<UnformattedHours> = {
    GW_Volunteers__Contact__c: contactId,
    GW_Volunteers__Volunteer_Shift__c: shiftId,
    GW_Volunteers__Status__c: "Confirmed",
    GW_Volunteers__Volunteer_Job__c: jobId,
    GW_Volunteers__Start_Date__c: date,
    Restaurant_Meals__c: restaurantMeals,
  };

  if (mealCount) {
    const mealType = soup ? "Soup" : "Entree";
    hoursToAdd.Type_of_Meal__c = mealType;
    hoursToAdd.Number_of_Meals__c = mealCount;
  }

  if (numberOfVolunteers) {
    hoursToAdd.GW_Volunteers__Number_of_Volunteers__c = numberOfVolunteers;
  }

  const hoursInsertUri =
    urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Hours__c";
  const insertRes: { data: InsertSuccessResponse } = await fetcher.post(
    hoursInsertUri,
    hoursToAdd
  );

  if (!insertRes.data?.success) {
    throw new Error("Unable to insert hours!");
  }
  const res: { data: UnformattedHours | undefined } = await fetcher.get(
    urls.SFOperationPrefix +
      "/GW_Volunteers__Volunteer_Hours__c/" +
      insertRes.data.id
  );
  if (!res.data) {
    throw Error("Could not get newly created volunteer hours");
  }
  return {
    id: res.data.Id!,
    mealCount: res.data.Number_of_Meals__c?.toString() || "0",
    shift: res.data.GW_Volunteers__Volunteer_Shift__c,
    job: res.data.GW_Volunteers__Volunteer_Job__c,
    time: res.data.GW_Volunteers__Shift_Start_Date_Time__c!,
    status: res.data.GW_Volunteers__Status__c,
  };
};

export const getTextReminderHours = async (contactId: string) => {
  await fetcher.setService("salesforce");

  const query = `SELECT Id from GW_Volunteers__Volunteer_Hours__c WHERE GW_Volunteers__Contact__c = '${contactId}' AND Text_Reminder_Status__c = 'Sent'`;
  const hoursQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const response: HoursQueryResponse = await fetcher.get(hoursQueryUri);

  if (!response.data?.records[0]) {
    return null;
  }
  return response.data.records[0].Id;
};

export const getHour = async (hoursId: string) => {
  await fetcher.setService("salesforce");

  const { data }: { data: UnformattedHours } = await fetcher.get(
    urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Hours__c/" + hoursId
  );

  return {
    id: data.Id,
    time: data.GW_Volunteers__Shift_Start_Date_Time__c!,
    job: data.GW_Volunteers__Volunteer_Job__c,
    status: data.GW_Volunteers__Status__c,
    shift: data.GW_Volunteers__Volunteer_Shift__c,
    campaign: data.GW_Volunteers__Volunteer_Campaign__c,
    mealType: data.Type_of_Meal__c,
  };
};

export const getHours = async (campaignId: string, contactId: string) => {
  await fetcher.setService("salesforce");

  const query = `SELECT Id, GW_Volunteers__Status__c, Number_of_Meals__c, GW_Volunteers__Shift_Start_Date_Time__c, GW_Volunteers__Volunteer_Job__c, GW_Volunteers__Volunteer_Shift__c, Type_of_Meal__c from GW_Volunteers__Volunteer_Hours__c WHERE GW_Volunteers__Volunteer_Campaign__c = '${campaignId}' AND GW_Volunteers__Contact__c = '${contactId}'`;

  const hoursQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const response: HoursQueryResponse = await fetcher.get(hoursQueryUri);
  if (!response.data?.records) {
    throw Error("Could not query volunteer hours");
  }
  const hours: FormattedHours[] = response.data.records.map((h) => {
    let mealCount = h.Number_of_Meals__c;
    if (!mealCount) {
      mealCount = 0;
    }
    return {
      id: h.Id,
      mealCount: mealCount.toString(),
      time: h.GW_Volunteers__Shift_Start_Date_Time__c!,
      job: h.GW_Volunteers__Volunteer_Job__c,
      status: h.GW_Volunteers__Status__c,
      shift: h.GW_Volunteers__Volunteer_Shift__c,
      campaign: campaignId,
      mealType: h.Type_of_Meal__c,
    };
  });
  return hours;
};

export const editHours = async ({
  mealCount,
  id,
  mealType,
  status,
  respondedToReminder,
}: {
  mealCount?: number;
  id: string;
  mealType?: "Entree" | "Soup";
  status?: string;
  respondedToReminder?: boolean;
}) => {
  await fetcher.setService("salesforce");

  const hoursToUpdate: Partial<UnformattedHours> = {
    Number_of_Meals__c: mealCount,
    Type_of_Meal__c: mealType,
  };

  if (status) {
    hoursToUpdate.GW_Volunteers__Status__c = status;
  }

  if (respondedToReminder) {
    hoursToUpdate.Text_Reminder_Status__c = "Responded";
  }

  const hoursUpdateUri =
    urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Hours__c/" + id;
  await fetcher.patch(hoursUpdateUri, hoursToUpdate);
};

export const deleteVolunteerHours = async (id: string) => {
  await fetcher.setService("salesforce");

  const hoursToUpdate = { GW_Volunteers__Status__c: "Canceled" };

  const hoursUpdateUri =
    urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Hours__c/" + id;
  await fetcher.patch(hoursUpdateUri, hoursToUpdate);
};
