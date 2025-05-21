import express from "express";

import {
  getContactByEmail,
  addContact,
} from "../../utils/salesforce/SFQuery/contact/contact";

const router = express.Router();

router.post("/", async (req, res) => {
  const {
    email,
    firstName,
    lastName,
  }: { email?: string; firstName: string; lastName: string } = req.body;

  if (!firstName || !lastName) {
    throw Error("You must provide first name and last name.");
  }

  const contact = await addContact({
    Email: email,
    FirstName: firstName,
    LastName: lastName,
    CK_Kitchen_Volunteer_Status__c: "Prospective",
  });
  res.send(contact);
});

router.get("/:email", async (req, res) => {
  const { email } = req.params;
  const contact = await getContactByEmail(email);

  return res.send(contact);
});

// router.post("/doorfront", async (req, res) => {
//   const {
//     firstName,
//     lastName,
//     email,
//     daysAvailable,
//   }: {
//     firstName: string;
//     lastName: string;
//     email: string;
//     daysAvailable: string[];
//   } = req.body;

//   let contact = await getContactByEmail(email);
//   if (!contact) {
//     contact = await addContact({
//       FirstName: firstName,
//       LastName: lastName,
//       Email: email,
//     });
//   }

//   if (contact) {
//     await insertCampaignMember({
//       CampaignId: urls.frontDoorCampaignId,
//       ContactId: contact.id,
//       Status: "Prospect",
//     });
//   }

//   const body = `
//   <p>This info was submitted through the doorfront volunteer signup form:</p>
//   <ul>
//   <li>
//   Name: ${firstName} ${lastName}
//   </li>
//   <li>
//   email: ${email}
//   </li>
//   <li>
//   Days Available: ${daysAvailable.map((day) => `${day} `)}
//   </li>
//   </ul>
//   <p>A list of people who have filled out this form is <a href="https://communitykitchens.lightning.force.com/lightning/r/Campaign/701UP00000JdCfxYAF/view">here.</a></p>
//   `;

//   await sendEmail({
//     html: body,
//     subject: "Someone submitted a doorfront volunteer form!",
//     to: "kenai@ckoakland.org",
//     from: "andy@ckoakland.org",
//   });

//   // email kenai

//   res.send(null);
// });

export default router;
