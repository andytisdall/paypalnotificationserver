import fetcher from "../../../fetcher";
import urls from "../../../urls";

export const deleteVolunteerHours = async (id: string) => {
  await fetcher.setService("salesforce");

  const hoursToUpdate = { GW_Volunteers__Status__c: "Canceled" };

  const hoursUpdateUri =
    urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Hours__c/" + id;
  await fetcher.patch(hoursUpdateUri, hoursToUpdate);
};
