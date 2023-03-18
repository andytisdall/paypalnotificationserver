import mongoose from 'mongoose';

import { getContactById } from '../utils/salesforce/SFQuery';

const User = mongoose.model('User');
const Restaurant = mongoose.model('Restaurant');

export type AccountType = 'restaurant' | 'contact';

export type ContactAccount = {
  name: string;
  salesforceId: string;
  lastName: string;
  firstName: string;
  volunteerAgreement: boolean;
  type: 'contact';
};

export type RestaurantAccount = {
  name: string;
  salesforceId: string;
  onboarding: string;
  type: 'restaurant';
};

export type Account = ContactAccount | RestaurantAccount;

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
      onboarding: restaurant.Meal_Program_Onboarding__c,
      type: accountType,
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
      firstName: contact.FirstName,
      lastName: contact.LastName,
      volunteerAgreement: contact.Home_Chef_Volunteeer_Agreement__c,
      type: accountType,
    };
  }
};
