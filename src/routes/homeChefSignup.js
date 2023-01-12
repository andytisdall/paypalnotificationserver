const express = require('express');
const axios = require('axios');
const passwordGenerator = require('generate-password');

const { getContact, addContact } = require('../services/SFQuery');
const getSFToken = require('../services/getSFToken');
const { User } = require('../models/user');
const { sendHomeChefSignupEmail } = require('../services/email');
const urls = require('../services/urls');

const axiosInstance = axios.create({
  baseURL: urls.salesforce,
});

const router = express.Router();

router.post('/home-chef/signup', async (req, res) => {
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
  const username = firstName.charAt(0) + lastName;

  const existingUser = await User.findOne({ username });
  if (!existingUser) {
    const newUser = new User({ username, password: temporaryPassword });
    await newUser.save();
  }

  const token = await getSFToken();
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

  let existingContact = await getContact(lastName, email, axiosInstance);
  if (!existingContact) {
    // contact needs to be added first so that opp can have a contactid
    const contactToAdd = {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      HomePhone: phoneNumber,
      GW_Volunteers__Volunteer_Availability__c: daysAvailable,
      GW_Volunteers__Volunteer_Skills__c: 'Cooking',
      GW_Volunteers__Volunteer_Status__c: 'Prospective',
      GW_Volunteers__Volunteer_Manager_Notes__c: extraInfo,
      instagramHandle,
      commit,
      foodHandler,
      experience,
      attend,
      pickup,
      source,
      portalUsername: username,
      portalTempPassword: temporaryPassword,
    };
    existingContact = await addContact(contactToAdd, axiosInstance);
  }

  await sendHomeChefSignupEmail(req.body);
  res.sendStatus(201);
});

module.exports = router;
