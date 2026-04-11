import fetcher from "../../../fetcher";
import urls from "../../../urls";
import { UnformattedHours } from "../types";

export const checkInVolunteer = async ({
  hoursId,
  duration,
}: {
  hoursId: string;
  duration: number;
}) => {
  await fetcher.setService("salesforce");

  const updateUri =
    urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Hours__c/" + hoursId;

  const updatedHours: Partial<UnformattedHours> = {
    GW_Volunteers__Status__c: "Completed",
    GW_Volunteers__Hours_Worked__c: duration,
  };

  await fetcher.patch(updateUri, updatedHours);
};
