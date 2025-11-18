import express from "express";

import { insertCampaignMember } from "../../utils/salesforce/SFQuery/volunteer/campaign/campaignMember";
import {
  addContact,
  getContactByEmail,
  updateContact,
} from "../../utils/salesforce/SFQuery/contact/contact";
import urls from "../../utils/urls";

const router = express.Router();

//generic event signup route

router.post("/events", async (req, res) => {
  const {
    firstName,
    lastName,
    phone,
    email,
    campaignId,
  }: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    campaignId: string;
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
    CampaignId: campaignId,
    ContactId: contact.id,
    Status: "Responded",
  });

  res.sendStatus(204);
});

export default router;
