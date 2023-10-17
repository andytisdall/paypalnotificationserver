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

interface Program {
  ckKitchen: boolean;
  ckHomeChef: boolean;
  other: string;
}

interface HomeChefSignupForm {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  program: Program;
  instagramHandle?: string;
  // commit: boolean;
  foodHandler?: boolean;
  daysAvailable: Record<string, boolean>;
  experience?: string;
  // attend: boolean;
  pickup?: boolean;
  source: string;
  extraInfo?: string;
}

router.post('/interest-form', async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    phoneNumber,
    instagramHandle,
    // commit,
    foodHandler,
    daysAvailable,
    experience,
    // attend,
    pickup,
    source,
    extraInfo,
    program,
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

  const contactInfo: UnformattedContact = {
    FirstName: firstName,
    LastName: lastName,
    Email: email,
    HomePhone: phoneNumber,
    GW_Volunteers__Volunteer_Availability__c: formattedDays,
    GW_Volunteers__Volunteer_Skills__c: 'Cooking',
    GW_Volunteers__Volunteer_Status__c: 'Prospective',
    GW_Volunteers__Volunteer_Notes__c: extraInfo,
    Instagram_Handle__c: instagramHandle,
    // Able_to_Commit__c: commit,
    Able_to_get_food_handler_cert__c: foodHandler,
    Cooking_Experience__c:
      !experience || experience === 'None' ? undefined : experience,
    // Able_to_attend_orientation__c: attend,
    Meal_Transportation__c: pickup,
    How_did_they_hear_about_CK__c: source,

    Home_Chef_Status__c: program.ckHomeChef ? 'Prospective' : undefined,
    CK_Kitchen_Volunteer_Status__c: program.ckKitchen
      ? 'Prospective'
      : undefined,
  };

  let existingContact = await getContact(lastName, firstName);
  if (existingContact) {
    if (!existingContact.portalUsername) {
      contactInfo.Portal_Username__c = uniqueUsername;
      contactInfo.Portal_Temporary_Password__c = temporaryPassword;
    }
    await updateContact(existingContact.id!, contactInfo);
  } else {
    existingContact = await addContact(contactInfo);
  }

  if (program.ckHomeChef) {
    const campaignMember: CampaignMemberObject = {
      CampaignId: urls.townFridgeCampaignId,
      ContactId: existingContact.id!,
      Status: 'Confirmed',
    };
    await insertCampaignMember(campaignMember);
  }

  if (program.ckKitchen) {
    const campaignMember: CampaignMemberObject = {
      CampaignId: urls.ckKitchenCampaignId,
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

  res.sendStatus(201);
});

// router.get('/migrate', async (req, res) => {
//   await migrate();
//   res.send('done');
// });

export default router;
