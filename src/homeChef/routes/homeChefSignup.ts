import express from 'express';
import passwordGenerator from 'generate-password';

import {
  getContact,
  addContact,
  updateContact,
  ContactInfo,
  insertCampaignMember,
  CampaignMemberObject,
} from '../../utils/salesforce/SFQuery';
import mongoose from 'mongoose';
import urls from '../../utils/urls';
import migrate from '../../utils/salesforce/migrations/migrateVolunteers';

const User = mongoose.model('User');
const router = express.Router();

interface HomeChefSignupForm {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  instagramHandle?: string;
  commit: boolean;
  foodHandler: boolean;
  daysAvailable: Record<string, boolean>;
  experience: 'Restaurant' | 'Home' | 'None';
  attend: boolean;
  pickup: boolean;
  source: string;
  extraInfo?: string;
}

router.post('/signup', async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    phoneNumber,
    instagramHandle,
    commit,
    foodHandler,
    daysAvailable,
    experience,
    attend,
    pickup,
    source,
    extraInfo,
  }: HomeChefSignupForm = req.body;

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

  const formattedDays =
    Object.keys(daysAvailable)
      .filter((d) => daysAvailable[d])
      .join(';') + ';';

  const contactInfo: ContactInfo = {
    FirstName: firstName,
    LastName: lastName,
    Email: email,
    HomePhone: phoneNumber,
    GW_Volunteers__Volunteer_Availability__c: formattedDays,
    GW_Volunteers__Volunteer_Skills__c: 'Cooking',
    GW_Volunteers__Volunteer_Status__c: 'Prospective',
    GW_Volunteers__Volunteer_Notes__c: extraInfo,
    Instagram_Handle__c: instagramHandle,
    Able_to_Commit__c: commit,
    Able_to_get_food_handler_cert__c: foodHandler,
    Cooking_Experience__c: experience === 'None' ? null : experience,
    Able_to_attend_orientation__c: attend,
    Meal_Transportation__c: pickup,
    How_did_they_hear_about_CK__c: source,
    Portal_Username__c: uniqueUsername,
    Portal_Temporary_Password__c: temporaryPassword,
    Home_Chef_Status__c: 'Prospective',
  };

  let existingContact = await getContact(lastName, firstName);
  if (existingContact) {
    await updateContact(existingContact.id, contactInfo);
  } else {
    // contact needs to be added first so that opp can have a contactid
    existingContact = await addContact(contactInfo);
  }

  const campaignMember: CampaignMemberObject = {
    CampaignId: urls.townFridgeCampaignId,
    ContactId: existingContact.id,
    Status: 'Confirmed',
  };
  await insertCampaignMember(campaignMember);

  const newUser = new User({
    username: uniqueUsername,
    password: temporaryPassword,
    salesforceId: existingContact.id,
  });
  await newUser.save();

  res.sendStatus(201);
});

// router.get('/migrate', async (req, res) => {
//   await migrate();
//   res.send('done');
// });

export default router;
