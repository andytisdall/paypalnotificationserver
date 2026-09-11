import express from "express";
import { getContactByLastNameAndEmail } from "../../utils/salesforce/contact/getContact";
import { createProgramEngagement } from "../../utils/salesforce/workforce";
import { updateContact } from "../../utils/salesforce/contact/updateContact";
import { addContact } from "../../utils/salesforce/contact/addContact";
import { CulinaryTrainingArgs } from "@community-kitchens/apiinterfaces";

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
  }: CulinaryTrainingArgs = req.body;

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
    contactId: contact!.id,
    internet,
    source,
    bio: description,
  });

  res.send(null);
});

export default router;
