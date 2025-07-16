import express from "express";
import {
  addContact,
  getContactByLastNameAndEmail,
  updateContact,
} from "../../utils/salesforce/SFQuery/contact/contact";
import { createProgramEngagement } from "../../utils/salesforce/SFQuery/workforce";

const router = express.Router();

router.post("/workforce-development", async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    phone,
    address,
    internet,
    description,
    source,
  }: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    internet: boolean;
    description: string;
    source: string;
  } = req.body;

  let contact = await getContactByLastNameAndEmail(lastName, email);
  if (contact) {
    await updateContact(contact.id, {
      FirstName: firstName,
      HomePhone: phone,
      MailingStreet: address,
    });
  } else {
    contact = await addContact({
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      HomePhone: phone,
      MailingStreet: address,
    });
  }

  await createProgramEngagement({
    contactId: contact.id,
    internet,
    source,
    bio: description,
  });

  res.send(null);
});

export default router;
