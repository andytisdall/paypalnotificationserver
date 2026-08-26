import fetcher from "../../../fetcher";
import urls from "../../../urls";

import { UnformattedHours } from "../types";

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
