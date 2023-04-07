import mongoose from 'mongoose';

import { getContactById } from '../utils/salesforce/SFQuery';
import { UserPayload } from '../middlewares/current-user';

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
  user: UserPayload
): Promise<Account | undefined> => {
  if (!accountType) {
    throw Error('No account type specified');
  }
  if (accountType === 'restaurant') {
    const restaurant = await Restaurant.findOne({ user: user.id });
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
