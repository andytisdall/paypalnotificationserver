import express from 'express';

import urls from '../../utils/urls';
import {
  getContactByEmail,
  addContact,
} from '../../utils/salesforce/SFQuery/contact';
import { insertCampaignMember } from '../../utils/salesforce/SFQuery/campaign';

const router = express.Router();

router.post('/home-chef-registration', async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    phone,
    source,
  }: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    source?: string;
  } = req.body;

  let contact = await getContactByEmail(email);
  if (!contact) {
    contact = await addContact({
      Email: email,
      FirstName: firstName,
      LastName: lastName,
      HomePhone: phone,
      How_did_they_hear_about_CK__c: source,
      Home_Chef_Status__c: 'Prospective',
      GW_Volunteers__Volunteer_Status__c: 'Prospective',
    });

    await insertCampaignMember({
      CampaignId: urls.townFridgeCampaignId,
      ContactId: contact.id!,
      Status: 'Confirmed',
    });
  }

  await insertCampaignMember({
    ContactId: contact.id!,
    CampaignId: urls.homeChefInPersonCampaignId,
    Status: 'Confirmed',
  });

  res.sendStatus(204);
});

export default router;
