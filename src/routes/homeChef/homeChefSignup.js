const express = require('express');
const axios = require('axios');
const passwordGenerator = require('generate-password');

const {
  getContact,
  addContact,
  updateContact,
} = require('../../services/salesforce/SFQuery');
const getSFToken = require('../../services/salesforce/getSFToken');
const { User } = require('../../models/user');
const { sendHomeChefSignupEmail } = require('../../services/email');
const urls = require('../../services/urls');

const axiosInstance = axios.create({
  baseURL: urls.salesforce,
});

const router = express.Router();

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
  } = req.body;

  const temporaryPassword = passwordGenerator.generate({
    length: 10,
    numbers: true,
  });
  const username = firstName.charAt(0).toLowerCase() + lastName.toLowerCase();

  const token = await getSFToken();
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

  const formattedDays =
    Object.keys(daysAvailable)
      .filter((d) => daysAvailable[d])
      .join(';') + ';';

  const contactInfo = {
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

  let existingContact = await getContact(lastName, email, axiosInstance);
  if (existingContact) {
    await updateContact(existingContact.Id, contactInfo, axiosInstance);
  } else {
    // contact needs to be added first so that opp can have a contactid
    existingContact = await addContact(contactInfo, axiosInstance);
  }

  const existingUser = await User.findOne({ username });
  if (!existingUser) {
    const newUser = new User({
      username,
      password: temporaryPassword,
      salesforceId: existingContact.Id,
    });
    await newUser.save();
  }

  await sendHomeChefSignupEmail(req.body);
  res.sendStatus(201);
});

module.exports = router;
