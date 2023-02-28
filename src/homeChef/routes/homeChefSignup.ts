import express from 'express';
import passwordGenerator from 'generate-password';

import {
  getContact,
  addContact,
  updateContact,
  ContactInfo,
} from '../../services/salesforce/SFQuery';
import mongoose from 'mongoose';
import { sendHomeChefSignupEmail } from '../../services/email';

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
  const username = firstName.charAt(0).toLowerCase() + lastName.toLowerCase();

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
    Portal_Username__c: username,
    Portal_Temporary_Password__c: temporaryPassword,
    Home_Chef_Status__c: 'Prospective',
  };

  let existingContact = await getContact(lastName, email);
  // console.log(existingContact);
  if (existingContact) {
    await updateContact(existingContact.id, contactInfo);
  } else {
    // contact needs to be added first so that opp can have a contactid
    existingContact = await addContact(contactInfo);
  }

  let uniqueUsername = username;
  let existingUser = await User.findOne({ username });
  while (existingUser) {
    let i = 1;
    uniqueUsername = username + i;
    existingUser = await User.findOne({ username: uniqueUsername });
    i++;
  }

  const newUser = new User({
    username: uniqueUsername,
    password: temporaryPassword,
    salesforceId: existingContact.id,
  });
  await newUser.save();

  await sendHomeChefSignupEmail(req.body);
  res.sendStatus(201);
});

export default router;