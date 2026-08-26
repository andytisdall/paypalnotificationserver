import fetcher from "../../../fetcher";
import urls from "../../../urls";
import { getContactById } from "../../contact/getContact";
import { InsertSuccessResponse } from "../../reusableTypes";
import { CreateHoursParams, UnformattedHours } from "../types";
import { VolunteerHours } from "@community-kitchens/apiinterfaces";

export const createHours = async ({
  contactId,
  shiftId,
  jobId,
  date,
  soup,
  mealCount,
  numberOfVolunteers,
  restaurantMeals,
  reserved,
}: CreateHoursParams): Promise<VolunteerHours> => {
  await fetcher.setService("salesforce");

  const contact = await getContactById(contactId);
  if (contact.Banned_from_Volunteering__c) {
    throw Error("This contact is banned from signing up to volunteer");
  }

  const { data } = await fetcher.get(
    urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Shift__c/" + shiftId,
  );

  if (data.GW_Volunteers__Number_of_Volunteers_Still_Needed__c === 0) {
    console.log(data);
    throw new Error("This shift has no available slots");
  }

  const hoursToAdd: Partial<UnformattedHours> = {
    GW_Volunteers__Contact__c: contactId,
    GW_Volunteers__Volunteer_Shift__c: shiftId,
    GW_Volunteers__Status__c: "Confirmed",
    GW_Volunteers__Volunteer_Job__c: jobId,
    GW_Volunteers__Start_Date__c: date,
    Restaurant_Meals__c: restaurantMeals,
    Reserved_for_Calfresh__c: reserved,
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
    hoursToAdd,
  );

  if (!insertRes.data?.success) {
    throw new Error("Unable to insert hours!");
  }
  const res: { data: UnformattedHours | undefined } = await fetcher.get(
    urls.SFOperationPrefix +
      "/GW_Volunteers__Volunteer_Hours__c/" +
      insertRes.data.id,
  );
  if (!res.data) {
    throw Error("Could not get newly created volunteer hours");
  }
  return {
    id: res.data.Id,
    mealCount: res.data.Number_of_Meals__c?.toString() || "0",
    shift: res.data.GW_Volunteers__Volunteer_Shift__c,
    job: res.data.GW_Volunteers__Volunteer_Job__c,
    time: res.data.GW_Volunteers__Shift_Start_Date_Time__c,
    status: res.data.GW_Volunteers__Status__c,
  };
};
