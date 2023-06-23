import moment from 'moment';

import fetcher from '../../fetcher';
import urls from '../../urls';
import { getAccountById } from './account';

export const getMealProgramSchedule = async () => {
  await fetcher.setService('salesforceMeal');

  const nextWeek = moment().add(7, 'days').format('YYYY-MM-DD');

  const deliveryQuery = `SELECT Date__c, CBO__c, Restaurant__c, Id, Time__c FROM Meal_Program_Delivery__c WHERE Date__c >= TODAY AND Date__c <= ${nextWeek}`;
  const deliveryyUri = urls.SFQueryPrefix + encodeURIComponent(deliveryQuery);
  const deliveryResponse = await fetcher.get(deliveryyUri);
  const deliveries = deliveryResponse.data.records;

  const accountQuery = `SELECT Id, Name FROM Account WHERE Meal_Program_Status__c = 'Active' OR Community_Group_Status__c = 'Meal Program'`;
  const accountUri = urls.SFQueryPrefix + encodeURIComponent(accountQuery);
  const accountResponse = await fetcher.get(accountUri);
  const accounts = accountResponse.data.records;

  return { accounts, deliveries };
};

export const getRestaurantMealProgramSchedule = async (accountId: string) => {
  await fetcher.setService('salesforceMeal');

  const nextWeek = moment().add(7, 'days').format('YYYY-MM-DD');

  const deliveryQuery = `SELECT Date__c, CBO__c, Id, Time__c FROM Meal_Program_Delivery__c WHERE Date__c >= TODAY AND Date__c <= ${nextWeek} AND Restaurant__c = '${accountId}'`;
  const deliveryyUri = urls.SFQueryPrefix + encodeURIComponent(deliveryQuery);
  const deliveryResponse = await fetcher.get(deliveryyUri);
  const deliveries: { CBO__c: string }[] = deliveryResponse.data.records;

  const accountPromises = deliveries.map(
    async (delivery: { CBO__c: string }) => {
      return getAccountById(delivery.CBO__c);
    }
  );

  const accounts = await Promise.all(accountPromises);

  return { accounts, deliveries };
};
