import { AccountData } from '../../utils/salesforce/SFQuery/fileUpload';
import { RestaurantAccount } from './getModel';
import urls from '../../utils/urls';
import fetcher from '../../utils/fetcher';
import { restaurantFileInfo } from './metadata';

export default async (
  fileTitles: string[],
  data: AccountData,
  restaurant: RestaurantAccount,
  date?: string
) => {
  let allCompletedDocs = fileTitles;

  if (data.Meal_Program_Onboarding__c) {
    allCompletedDocs = [
      ...new Set([
        ...data.Meal_Program_Onboarding__c.split(';'),
        ...fileTitles,
      ]),
    ];
    data.Meal_Program_Onboarding__c = allCompletedDocs.join(';') + ';';
  } else {
    data.Meal_Program_Onboarding__c = fileTitles.join(';') + ';';
  }

  if (date) {
    data.Health_Department_Expiration_Date__c = date;
  }
  //  mark account as active if all required docs are present

  const allDocs = Object.values(restaurantFileInfo).map((doc) => doc.title);
  const dateExists = !!(date || data.Health_Department_Expiration_Date__c);
  if (
    allDocs.every((doc) => Object.values(allCompletedDocs).includes(doc)) &&
    dateExists
  ) {
    data.Meal_Program_Status__c = 'Active';
  }

  const restaurantUpdateUri =
    urls.SFOperationPrefix + '/Account/' + restaurant.salesforceId;

  const updateData: Partial<AccountData> = {
    Health_Department_Expiration_Date__c: date,
    Meal_Program_Status__c: data.Meal_Program_Status__c,
    Meal_Program_Onboarding__c: data.Meal_Program_Onboarding__c,
  };

  await fetcher.patch(restaurantUpdateUri, updateData);
};
