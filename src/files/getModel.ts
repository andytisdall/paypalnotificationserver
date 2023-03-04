import mongoose from 'mongoose';

import { getContactById } from '../services/salesforce/SFQuery';

const User = mongoose.model('User');
const Restaurant = mongoose.model('Restaurant');

export type AccountType = 'restaurant' | 'contact';

export type Account = {
  name: string;
  salesforceId: string;
  lastName?: string;
};

export const getAccountForFileUpload = async (
  accountType: AccountType,
  accountId: string
): Promise<Account | undefined> => {
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
    const contact = await getContactById(user.salesforceId);
    if (!contact) {
      throw Error('Could not fetch contact from salesforce');
    }
    return {
      name: user.username,
      salesforceId: user.salesforceId,
      lastName: contact.LastName,
    };
  }
};
