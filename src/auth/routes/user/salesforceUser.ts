import express from 'express';
import passwordGenerator from 'generate-password';
import mongoose from 'mongoose';

import { currentUser } from '../../../middlewares/current-user';
import { getContactById } from '../../../utils/salesforce/SFQuery/contact';
import { FormattedContact } from '../../../utils/salesforce/SFQuery/contact';
import { requireSalesforceAuth } from '../../../middlewares/require-salesforce-auth';

const User = mongoose.model('User');

const router = express.Router();

router.get('/userInfo', currentUser, async (req, res) => {
  // fail silently so users don't get an error on volunteer page
  if (!req.currentUser) {
    return res.sendStatus(204);
  }
  if (!req.currentUser!.salesforceId) {
    throw Error('User does not have a salesforce ID');
  }
  const contact = await getContactById(req.currentUser!.salesforceId);
  const contactInfo: Partial<FormattedContact> = {
    firstName: contact.FirstName,
    lastName: contact.LastName,
    volunteerAgreement: contact.CK_Kitchen_Agreement__c,
    homeChefAgreement: contact.Home_Chef_Volunteeer_Agreement__c,
    foodHandler: contact.Home_Chef_Food_Handler_Certification__c,
    homeChefStatus: contact.Home_Chef_Status__c,
    homeChefQuizPassed: contact.Home_Chef_Quiz_Passed__c,
  };
  res.send(contactInfo);
});

// route for salesforce flow to create portal user
router.post('/salesforce', requireSalesforceAuth, async (req, res) => {
  const {
    firstName,
    lastName,
    id,
  }: { firstName?: string; lastName: string; id: string } = req.body;

  const existingUser = await User.findOne({ salesforceId: id });

  const temporaryPassword = passwordGenerator.generate({
    length: 10,
    numbers: true,
  });

  if (existingUser) {
    existingUser.password = temporaryPassword;
    await existingUser.save();
    return res.status(200).send({
      username: existingUser.username,
      password: temporaryPassword,
    });
  }

  const username = (
    firstName?.charAt(0).toLowerCase() + lastName.toLowerCase()
  ).replace(' ', '');

  let uniqueUsername = username;
  let existingUsername = await User.findOne({ username });
  let i = 1;
  while (existingUsername) {
    uniqueUsername = username + i;
    existingUsername = await User.findOne({ username: uniqueUsername });
    i++;
  }

  const newUser = new User({
    username: uniqueUsername,
    password: temporaryPassword,
    salesforceId: id,
  });
  await newUser.save();

  res
    .status(201)
    .send({ username: uniqueUsername, password: temporaryPassword });
});

export default router;
