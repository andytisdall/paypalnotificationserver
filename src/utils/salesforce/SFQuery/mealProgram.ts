import moment from 'moment';

import fetcher from '../../fetcher';
import urls from '../../urls';
import { getAccountById } from './account';
import { UnformattedRestaurant } from './account';

interface UnformattedMealDelivery {
  Date__c: string;
  CBO__c: string;
  Restaurant__c: string;
  Id: string;
  Time__c: string;
  Delivery_Method__c: string;
  Number_of_Meals_Meat__c: number;
  Number_of_Meals_Veg__c: number;
  Delivery_Notes__c: string;
  Price_Per_Meal__c: number;
}

interface FormattedMealDelivery {
  date: string;
  cbo: string;
  restaurant: string;
  id: string;
  time: string;
  deliveryMethod: string;
  numberOfMealsMeat: number;
  numberOfMealsVeg: number;
  notes: string;
  price: number;
}

const formatMealDelivery = (
  unformattedDelivery: UnformattedMealDelivery
): FormattedMealDelivery => {
  return {
    date: unformattedDelivery.Date__c,
    cbo: unformattedDelivery.CBO__c,
    restaurant: unformattedDelivery.Restaurant__c,
    id: unformattedDelivery.Id,
    time: unformattedDelivery.Time__c,
    deliveryMethod: unformattedDelivery.Delivery_Method__c,
    numberOfMealsMeat: unformattedDelivery.Number_of_Meals_Meat__c,
    numberOfMealsVeg: unformattedDelivery.Number_of_Meals_Veg__c,
    notes: unformattedDelivery.Delivery_Notes__c,
    price: unformattedDelivery.Price_Per_Meal__c,
  };
};

export const getMealProgramSchedule = async () => {
  await fetcher.setService('salesforceMeal');

  const nextWeek = moment().add(7, 'days').format('YYYY-MM-DD');

  const deliveryQuery = `SELECT Date__c, CBO__c, Restaurant__c, Id, Time__c, Delivery_Method__c, Number_of_Meals_Meat__c, Number_of_Meals_Veg__c, Delivery_Notes__c, Price_Per_Meal__c FROM Meal_Program_Delivery__c WHERE Date__c >= TODAY AND Date__c <= ${nextWeek}`;
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
      console.log('query1');
      return getAccountById(delivery.CBO__c);
    });

  const missingRestaurantPromises = deliveries
    .filter((del) => {
      return !accounts.find((acc) => del.Restaurant__c === acc.Id);
    })
    .map(async (delivery: UnformattedMealDelivery) => {
      console.log('query2');
      return getAccountById(delivery.Restaurant__c);
    });

  const remainingAccounts = await Promise.all([
    ...missingCBOPromises,
    ...missingRestaurantPromises,
  ]);

  return {
    accounts: [...accounts, ...remainingAccounts].map((a) => {
      return { id: a.Id, name: a.Name };
    }),
    deliveries: deliveries.map(formatMealDelivery),
  };
};

export const getRestaurantMealProgramSchedule = async (accountId: string) => {
  await fetcher.setService('salesforceMeal');

  const nextWeek = moment().add(7, 'days').format('YYYY-MM-DD');

  const deliveryQuery = `SELECT Date__c, CBO__c, Id, Time__c, Delivery_Method__c, Number_of_Meals_Meat__c, Number_of_Meals_Veg__c, Delivery_Notes__c, Price_Per_Meal__c FROM Meal_Program_Delivery__c WHERE Date__c >= TODAY AND Date__c <= ${nextWeek} AND Restaurant__c = '${accountId}'`;
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
