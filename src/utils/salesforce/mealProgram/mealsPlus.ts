import fetcher from "../../fetcher";
import { MealsPlusArgs, MealsPlusService } from "./types";
import urls from "../../urls";

export const submitMealsPlusData = async ({
  name,
  cbo,
  location,
  time,
  instructions,
  description,
  contactId,
}: MealsPlusArgs) => {
  await fetcher.setService("salesforce");

  const url = urls.SFOperationPrefix + "/Meals_Plus_Service_Submission__c";

  const newSubmission: MealsPlusService = {
    Name: name,
    Description__c: description,
    CBO_Name__c: cbo,
    Location__c: location,
    Time__c: time,
    Instructions__c: instructions,
    Contact__c: contactId,
  };

  await fetcher.post(url, newSubmission);
};
