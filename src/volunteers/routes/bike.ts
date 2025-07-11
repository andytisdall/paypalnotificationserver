import express from "express";
import { sendEmail } from "../../utils/email/email";
import {
  addContact,
  getContactByEmail,
} from "../../utils/salesforce/SFQuery/contact/contact";
import { insertCampaignMember } from "../../utils/salesforce/SFQuery/volunteer/campaign/campaignMember";
import urls from "../../utils/urls";

const router = express.Router();

router.post("/bike", async (req, res) => {
  const { email, firstName, lastName, bikeNotes } = req.body;

  const body = `
    Email: ${email}
    First Name: ${firstName}
    Last Name: ${lastName}
    Bike Notes: ${bikeNotes}
    `;

  await sendEmail({
    html: body,
    text: body,
    to: "andy@ckoakland.org",
    from: "andy@ckoakland.org",
    subject: "Bike Volunteer Submission",
  });

  let contact = await getContactByEmail(email);
  if (!contact) {
    contact = await addContact({
      Email: email,
      FirstName: firstName,
      LastName: lastName,
    });
  }

  if (contact) {
    await insertCampaignMember({
      ContactId: contact?.id,
      Status: "Confirmed",
      CampaignId: urls.bikeCampaignId,
    });
  }

  res.send(null);
});

export default router;
