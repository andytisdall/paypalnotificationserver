import express from "express";
import { sendEmail } from "../../utils/email";
import {
  addContact,
  getContactByEmail,
} from "../../utils/salesforce/SFQuery/contact/contact";

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
    text: body,
    to: "andy@ckoakland.org",
    from: "andy@ckoakland.org",
    subject: "Bike Volunteer Submission",
  });

  const contact = await getContactByEmail(email);
  if (!contact) {
    await addContact({
      Email: email,
      FirstName: firstName,
      LastName: lastName,
    });
  }

  res.send(null);
});

export default router;
