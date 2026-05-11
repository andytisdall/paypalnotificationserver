import fetcher from "../../fetcher";
import {
  FormattedMealsPlusService,
  MealsPlusArgs,
  MealsPlusService,
} from "./types";
import urls from "../../urls";
import createQuery, { FilterGroup } from "../queryCreator";

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

export const getMealsPlusData = async (): Promise<
  FormattedMealsPlusService[]
> => {
  const fields = [] as const;
  const obj = "Meals_Plus_Service__c";
  const filters: FilterGroup<MealsPlusService> = {
    AND: [{ field: "Display_on_Site__c", value: true }],
  };

  const services = await createQuery<MealsPlusService, (typeof fields)[number]>(
    { fields, obj, filters },
  );

  // @ts-ignore
  return services.map(formatService);
};

const formatService = (service: MealsPlusService) => {
  return {
    name: service.Name,
    description: service.Description__c,
    location: service.Location__c,
    cbo: service.CBO_Name__c,
    time: service.Time__c,
    instructions: service.Instructions__c,
    url: service.URL__c,
    phone: service.Phone__c,
  };
};
