import express from 'express';
import passwordGenerator from 'generate-password';

import {
  getContact,
  addContact,
  updateContact,
  UnformattedContact,
} from '../../utils/salesforce/SFQuery/contact';
import {
  insertCampaignMember,
  CampaignMemberObject,
} from '../../utils/salesforce/SFQuery/campaign';
import mongoose from 'mongoose';
import urls from '../../utils/urls';

const User = mongoose.model('User');
const router = express.Router();

// interface VolunteerInterestFormArgs {
//   email: string;
//   firstName: string;
//   lastName: string;
//   phoneNumber: string;
//   instagramHandle?: string;
//   foodHandler?: boolean;
//   foodHandlerOther?: string;
//   experience?: string;
//   transport?: boolean;
//   transportOther?: string;
//   workOnFeet?: boolean;
//   workOnFeetOther?: string;
//   source: string;
//   extraInfo?: string;
//   programs: {
//     ckKitchen: boolean;
//     ckHomeChefs: boolean;
//     corporate: boolean;
//     other: string;
//   };
// }

interface VolunteerInterestFormArgs {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  zoom?: boolean;
  inPerson?: boolean;
  unavailable?: boolean;
  feet?: boolean;
  source: string;
  extraInfo?: string;
  programs: {
    ckKitchen: boolean;
    homeChef: boolean;
  };
}

router.post('/signup', async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    phoneNumber,
    // instagramHandle,
    // foodHandler,
    // foodHandlerOther,
    // experience,
    // transport,
    // transportOther,
    // workOnFeet,
    // workOnFeetOther,
    zoom,
    inPerson,
    unavailable,
    feet,
    source,
    extraInfo,
    programs,
  }: VolunteerInterestFormArgs = req.body;

  const temporaryPassword = passwordGenerator.generate({
    length: 10,
    numbers: true,
  });
  const username = (
    firstName.charAt(0).toLowerCase() + lastName.toLowerCase()
  ).replace(' ', '');

  let uniqueUsername = username;
  let existingUser = await User.findOne({ username });
  let i = 1;
  while (existingUser) {
    uniqueUsername = username + i;
    existingUser = await User.findOne({ username: uniqueUsername });
    i++;
  }

  const contactInfo: UnformattedContact = {
    FirstName: firstName,
    LastName: lastName,
    Email: email,
    HomePhone: phoneNumber,
    GW_Volunteers__Volunteer_Skills__c: 'Cooking',
    GW_Volunteers__Volunteer_Notes__c: extraInfo,
    How_did_they_hear_about_CK__c: source,
    Portal_Username__c: uniqueUsername,
    Portal_Temporary_Password__c: temporaryPassword,
    Able_to_work_on_feet__c: feet,
    GW_Volunteers__Volunteer_Status__c: 'Prospective',
  };

  if (programs.homeChef) {
    contactInfo.Home_Chef_Status__c = 'Prospective';
  }

  if (programs.ckKitchen) {
    contactInfo.CK_Kitchen_Volunteer_Status__c = 'Prospective';
  }

  let existingContact = await getContact(lastName, firstName);
  if (existingContact) {
    await updateContact(existingContact.id!, contactInfo);
  } else {
    // contact needs to be added first so that opp can have a contactid
    existingContact = await addContact(contactInfo);
  }

  if (!existingContact) {
    throw Error('Error adding contact');
  }

  if (programs.homeChef) {
    const campaignMember: CampaignMemberObject = {
      CampaignId: urls.townFridgeCampaignId,
      ContactId: existingContact.id!,
      Status: 'Confirmed',
    };
    await insertCampaignMember(campaignMember);
    // to do: seperate into zoom / in person / unavailable campaigns
  }

  if (programs.ckKitchen) {
    const campaignMember: CampaignMemberObject = {
      CampaignId: urls.ckKitchenCampaignId,
      ContactId: existingContact.id!,
      Status: 'Confirmed',
    };
    await insertCampaignMember(campaignMember);
  }

  if (!existingContact.portalUsername) {
    const newUser = new User({
      username: uniqueUsername,
      password: temporaryPassword,
      salesforceId: existingContact.id,
    });
    await newUser.save();
  }

  res.sendStatus(204);
});

export default router;
