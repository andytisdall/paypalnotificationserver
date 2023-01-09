const express = require('express');
const axios = require('axios');

const { getContact, addContact } = require('../services/SFQuery');
const { User } = require('../models/user');
const getSFToken = require('../services/getSFToken');

const axiosInstance = axios.create({
  baseURL: 'https://communitykitchens.my.salesforce.com/services',
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

  const token = await getSFToken();
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

  let existingContact = await getContact(lastName, email, axiosInstance);
  if (!existingContact) {
    // contact needs to be added first so that opp can have a contactid
    const contactToAdd = {
      FirstName: firstName,
      LastName: lastName,
      Email: paypalData.payer_email,
      Description:
        'Added into Salesforce by the server on ' + moment().format('M/D/YY'),
    };
    existingContact = await addContact(contactToAdd, axiosInstance);
  }
});

module.exports = router;
