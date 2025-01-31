import { format, utcToZonedTime } from 'date-fns-tz';

import fetcher from '../../fetcher';
import urls from '../../urls';
import { getAccountById } from './account/account';
import { UnformattedRestaurant } from './account/types';
import { MealSurveyArgs } from '../../../mealProgram/routes/survey';

export interface NewMobileOasisDelivery {
  numberOfMealsMeat: number;
  numberOfMealsVeg: number;
}

interface MealSurveyData {
  Age__c?: string;
  Ethnicity__c?: string;
  Zip_Code__c?: string;
  Access_to_Microwave__c?: boolean;
  Access_to_Utensils__c?: boolean;
  How_many_people_served__c?: string;
  Children_under_10__c?: boolean;
  Town_fridge_access_time_of_day__c?: string;
  Favorite_Food__c?: string;
  Favorite_Food_2__c?: string;
  Dietary_Preferences__c?: string;
  Fruit_Wanted__c?: boolean;
  Enjoying_Meals__c?: boolean;
  Access_to_Healthy_Meals__c?: boolean;
  Skip_a_Meal__c?: string;
}

interface UnformattedMealDelivery {
  Date__c: string;
  CBO__c: string;
  Restaurant__c: string;
  Id?: string;
  Time__c?: string;
  TextTime__c?: string;
  Delivery_Method__c: string;
  Number_of_Meals_Meat__c: number;
  Number_of_Meals_Veg__c: number;
  Delivery_Notes__c: string;
  Price_Per_Meal__c?: number;
  Is_This_Week__c?: boolean;
  Is_Next_Week__c?: boolean;
  Funding_Source__c?: string;
}

interface FormattedMealDelivery {
  date: string;
  cbo: string;
  restaurant: string;
  id?: string;
  time: string;
  deliveryMethod: string;
  numberOfMealsMeat: number;
  numberOfMealsVeg: number;
  notes: string;
  price?: number;
  isThisWeek?: boolean;
  isNextWeek?: boolean;
}

const formatMealDelivery = (
  unformattedDelivery: UnformattedMealDelivery
): FormattedMealDelivery => {
  return {
    date: unformattedDelivery.Date__c,
    cbo: unformattedDelivery.CBO__c,
    restaurant: unformattedDelivery.Restaurant__c,
    id: unformattedDelivery.Id,
    time: unformattedDelivery.Time__c!,
    deliveryMethod: unformattedDelivery.Delivery_Method__c,
    numberOfMealsMeat: unformattedDelivery.Number_of_Meals_Meat__c,
    numberOfMealsVeg: unformattedDelivery.Number_of_Meals_Veg__c,
    notes: unformattedDelivery.Delivery_Notes__c,
    price: unformattedDelivery.Price_Per_Meal__c,
    isThisWeek: unformattedDelivery.Is_This_Week__c,
    isNextWeek: unformattedDelivery.Is_Next_Week__c,
  };
};

export const getMealProgramSchedule = async () => {
  await fetcher.setService('salesforce');

  const deliveryQuery = `SELECT Date__c, CBO__c, Restaurant__c, Id, Time__c, Delivery_Method__c, Number_of_Meals_Meat__c, Number_of_Meals_Veg__c, Delivery_Notes__c, Price_Per_Meal__c FROM Meal_Program_Delivery__c WHERE Is_This_Week__c = true OR Is_Next_Week__c = true`;
  const deliveryyUri = urls.SFQueryPrefix + encodeURIComponent(deliveryQuery);
  const deliveryResponse = await fetcher.get(deliveryyUri);
  const deliveries: UnformattedMealDelivery[] = deliveryResponse.data.records;

  const accountQuery = `SELECT Id, Name FROM Account WHERE Meal_Program_Status__c = 'Active' OR Type = 'Community Group' OR Type = 'Town Fridge'`;
  const accountUri = urls.SFQueryPrefix + encodeURIComponent(accountQuery);
  const accountResponse = await fetcher.get(accountUri);
  const accounts: UnformattedRestaurant[] = accountResponse.data.records;

  const missingCBOPromises = deliveries
    .filter((del) => {
      return !accounts.find((acc) => del.CBO__c === acc.Id);
    })
    .map(async (delivery: UnformattedMealDelivery) => {
      return getAccountById(delivery.CBO__c);
    });

  const missingRestaurantPromises = deliveries
    .filter((del) => {
      return !accounts.find((acc) => del.Restaurant__c === acc.Id);
    })
    .map(async (delivery: UnformattedMealDelivery) => {
      return getAccountById(delivery.Restaurant__c);
    });

  const remainingAccounts = await Promise.all([
    ...missingCBOPromises,
    ...missingRestaurantPromises,
  ]);

  return {
    accounts: [...accounts, ...remainingAccounts].map((a) => {
      return { id: a.Id, name: a.Name, address: a.Billing_Address };
    }),
    deliveries: deliveries.map(formatMealDelivery),
  };
};

export const getRestaurantMealProgramSchedule = async (accountId: string) => {
  await fetcher.setService('salesforce');

  const deliveryQuery = `SELECT Date__c, CBO__c, Id, Time__c, Delivery_Method__c, Number_of_Meals_Meat__c, Number_of_Meals_Veg__c, Delivery_Notes__c, Price_Per_Meal__c, Is_This_Week__c, Is_Next_Week__c FROM Meal_Program_Delivery__c WHERE Restaurant__c = '${accountId}' AND Is_This_Week__c = true OR Is_Next_Week__c = true`;
  const deliveryyUri = urls.SFQueryPrefix + encodeURIComponent(deliveryQuery);
  const deliveryResponse = await fetcher.get(deliveryyUri);
  const deliveries: UnformattedMealDelivery[] = deliveryResponse.data.records;

  const accountPromises = deliveries.map(
    async (delivery: UnformattedMealDelivery) => {
      return getAccountById(delivery.CBO__c);
    }
  );

  const accounts = await Promise.all(accountPromises);

  return {
    accounts: accounts.map((a) => {
      return { id: a.Id, name: a.Name };
    }),
    deliveries: deliveries.map(formatMealDelivery),
  };
};

export const createScheduledDelivery = async (
  delivery: NewMobileOasisDelivery
) => {
  await fetcher.setService('salesforce');
  const insertUri = urls.SFOperationPrefix + '/Meal_Program_Delivery__c';

  const newDelivery: UnformattedMealDelivery = {
    Date__c: new Date().toISOString(),
    CBO__c: urls.townFridgeAccountId,
    Restaurant__c: urls.ckKitchenAccountId,
    TextTime__c: format(
      utcToZonedTime(new Date(), 'America/Los_Angeles'),
      'HH:mm:ss.SSS'
    ),
    Delivery_Method__c: 'CK Pickup',
    Number_of_Meals_Meat__c: delivery.numberOfMealsMeat,
    Number_of_Meals_Veg__c: delivery.numberOfMealsVeg,
    Delivery_Notes__c: 'Added by mobile oasis driver',
    Funding_Source__c: 'CK',
  };

  await fetcher.post(insertUri, newDelivery);
};

export const submitMealSurveyData = async (data: MealSurveyArgs) => {
  await fetcher.setService('salesforce');

  const surveyData: MealSurveyData = {
    Age__c: data.age,
    Ethnicity__c: data.ethnicity,
    Zip_Code__c: data.zip,
    Access_to_Microwave__c: data.microwave,
    Access_to_Utensils__c: data.utensils,
    Children_under_10__c: data.children,
    How_many_people_served__c: data.numberOfPeople,
    Favorite_Food__c: data.mealType,
    Favorite_Food_2__c: data.mealType2,
    Dietary_Preferences__c: data.dietary?.join(';'),
    Enjoying_Meals__c: data.taste,
    Fruit_Wanted__c: data.fruit,
    Town_fridge_access_time_of_day__c: data.time,
    Access_to_Healthy_Meals__c: data.access,
    Skip_a_Meal__c: data.skip,
  };

  const insertUri = urls.SFOperationPrefix + '/Meal_Survey_Data_2__c';
  const response = await fetcher.post(insertUri, surveyData);

  if (!response.data.success) {
    throw new Error('Could not save the survey results');
  }
};
