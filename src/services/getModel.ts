import mongoose from 'mongoose';

import urls from '../services/urls';
import fetcher from './fetcher';

const User = mongoose.model('User');
const Restaurant = mongoose.model('Restaurant');

export type AccountType = 'restaurant' | 'contact';

export const getAccountForFileUpload = async (
  accountType: AccountType,
  accountId: string
) => {
  if (accountType === 'restaurant') {
    const restaurant = await Restaurant.findById(accountId);
    if (!restaurant) {
      throw Error('Restaurant not found');
    }
    return {
      name: restaurant.name,
      salesforceId: restaurant.salesforceId,
    };
  }
  if (accountType === 'contact') {
    const user = await User.findById(accountId);
    if (!user) {
      throw new Error('User not found');
    }
    await fetcher.setService('salesforce');
    const {
      data,
    }: { data: { LastName: string; npsp__HHId__c: string } | undefined } =
      await fetcher.instance.get(
        urls.SFOperationPrefix + '/Contact/' + user.salesforceId
      );
    if (!data?.LastName || !data.npsp__HHId__c) {
      throw Error('Did not get expected contact data from salesforce');
    }
    return {
      name: data.LastName,
      salesforceId: data.npsp__HHId__c,
    };
  }
};
