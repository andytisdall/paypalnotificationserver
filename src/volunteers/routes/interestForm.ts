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

interface VolunteerInterestFormArgs {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  instagramHandle?: string;
  foodHandler?: boolean;
  foodHandlerOther?: string;
  experience?: string;
  transport?: boolean;
  transportOther?: string;
  workOnFeet?: boolean;
  workOnFeetOther?: string;
  source: string;
  extraInfo?: string;
  programs: {
    ckKitchen: boolean;
    ckHomeChefs: boolean;
    corporate: boolean;
    other: string;
  };
}

router.post('/signup', async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    phoneNumber,
    instagramHandle,
    foodHandler,
    foodHandlerOther,
    experience,
    transport,
    transportOther,
    workOnFeet,
    workOnFeetOther,
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
    Instagram_Handle__c: instagramHandle,
    Able_to_get_food_handler_cert__c: foodHandler,
    Cooking_Experience__c: experience,
    How_did_they_hear_about_CK__c: source,
    Portal_Username__c: uniqueUsername,
    Portal_Temporary_Password__c: temporaryPassword,
    Able_to_get_food_handler_other__c: foodHandlerOther,
    Able_to_work_on_feet__c: workOnFeet,
    Able_to_work_on_feet_other__c: workOnFeetOther,
    Able_to_Commit__c: transport,
    Able_to_cook_and_transport_other__c: transportOther,
    GW_Volunteers__Volunteer_Status__c: 'Prospective',
  };

  if (programs.other) {
    contactInfo.Interest_in_other_volunteer_programs__c = programs.other;
  }

  if (programs.ckHomeChefs) {
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

  if (programs.ckHomeChefs) {
    const campaignMember: CampaignMemberObject = {
      CampaignId: urls.townFridgeCampaignId,
      ContactId: existingContact.id!,
      Status: 'Confirmed',
    };
    await insertCampaignMember(campaignMember);
  }

  if (programs.ckKitchen) {
    const campaignMember: CampaignMemberObject = {
      CampaignId: urls.ckKitchenCampaignId,
      ContactId: existingContact.id!,
      Status: 'Confirmed',
    };
    await insertCampaignMember(campaignMember);
  }

  if (programs.corporate) {
    const campaignMember: CampaignMemberObject = {
      CampaignId: urls.corporateVolunteersCampaignId,
      ContactId: existingContact.id!,
      Status: 'Confirmed',
    };
    await insertCampaignMember(campaignMember);
  }

  const newUser = new User({
    username: uniqueUsername,
    password: temporaryPassword,
    salesforceId: existingContact.id,
  });
  await newUser.save();

  res.sendStatus(204);
});

export default router;
