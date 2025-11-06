import express from "express";

import { insertCampaignMember } from "../../utils/salesforce/SFQuery/volunteer/campaign/campaignMember";
import {
  addContact,
  getContactByEmail,
  updateContact,
} from "../../utils/salesforce/SFQuery/contact/contact";
import urls from "../../utils/urls";

const router = express.Router();

router.post("/events/home-chef-orientation", async (req, res) => {
  const {
    firstName,
    lastName,
    phone,
    email,
  }: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  } = req.body;

  let contact = await getContactByEmail(email);
  if (!contact) {
    contact = await addContact({
      FirstName: firstName,
      LastName: lastName,
      HomePhone: phone,
      Email: email,
    });
  } else {
    await updateContact(contact.id, {
      FirstName: firstName,
      LastName: lastName,
      HomePhone: phone,
      Email: email,
    });
  }

  await insertCampaignMember({
    CampaignId: urls.homeChefInPersonCampaignId,
    ContactId: contact.id,
    Status: "Responded",
  });

  res.sendStatus(204);
});

router.post("/events/thanksgiving-2025", async (req, res) => {
  const {
    firstName,
    lastName,
    phone,
    email,
  }: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  } = req.body;

  let contact = await getContactByEmail(email);
  if (!contact) {
    contact = await addContact({
      FirstName: firstName,
      LastName: lastName,
      HomePhone: phone,
      Email: email,
    });
  } else {
    await updateContact(contact.id, {
      FirstName: firstName,
      LastName: lastName,
      HomePhone: phone,
      Email: email,
    });
  }

  await insertCampaignMember({
    CampaignId: urls.thanksgiving,
    ContactId: contact.id,
    Status: "Responded",
  });

  res.sendStatus(204);
});

export default router;
