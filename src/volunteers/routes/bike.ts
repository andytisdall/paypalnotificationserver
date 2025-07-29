import express from "express";
import {
  addContact,
  getContactByEmail,
  updateContact,
} from "../../utils/salesforce/SFQuery/contact/contact";
import { insertCampaignMember } from "../../utils/salesforce/SFQuery/volunteer/campaign/campaignMember";
import urls from "../../utils/urls";

const router = express.Router();

router.post("/bike", async (req, res) => {
  const { email, firstName, lastName, subscribe } = req.body;

  let contact = await getContactByEmail(email);
  if (!contact) {
    contact = await addContact({
      Email: email,
      FirstName: firstName,
      LastName: lastName,
      Subscribe_to_Bike_East_Bay_newsletter__c: subscribe,
    });
  } else {
    await updateContact(contact.id, {
      Subscribe_to_Bike_East_Bay_newsletter__c: subscribe,
    });
  }

  if (!contact) {
    throw Error("Could not process submission");
  }

  await insertCampaignMember({
    ContactId: contact.id,
    Status: "Confirmed",
    CampaignId: urls.bikeCampaignId,
  });

  res.send(null);
});

export default router;
