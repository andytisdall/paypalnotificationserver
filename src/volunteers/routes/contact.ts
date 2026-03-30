import express from "express";

import {
  getContactByEmail,
  addContact,
  updateContact,
  getContactsWhoSignedWaivers,
} from "../../utils/salesforce/SFQuery/contact/contact";
import {
  createPortalUser,
  getUniqueUsernameAndPassword,
} from "../../auth/routes/user/createUser";
import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { requireAdmin } from "../../middlewares/require-admin";

const router = express.Router();

router.post(
  "/reset-waivers",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const allContacts = await getContactsWhoSignedWaivers();
    const promises = allContacts.map(async (contact) => {
      await updateContact(contact.Id, { CK_Kitchen_Agreement__c: false });
    });

    await Promise.all(promises);

    res.send({ number: allContacts.length });
  },
);

router.post("/", async (req, res) => {
  const {
    email,
    firstName,
    lastName,
  }: { email?: string; firstName: string; lastName: string } = req.body;

  if (!firstName || !lastName) {
    throw Error("You must provide first name and last name.");
  }

  const { username, password } = await getUniqueUsernameAndPassword({
    firstName,
    lastName,
  });

  const contact = await addContact({
    Email: email,
    FirstName: firstName,
    LastName: lastName,
    CK_Kitchen_Volunteer_Status__c: "Prospective",
    Portal_Username__c: username,
    Portal_Temporary_Password__c: password,
  });

  await createPortalUser({
    username,
    password,
    salesforceId: contact.id,
  });

  res.send(contact);
});

router.get("/:email", async (req, res) => {
  const { email } = req.params;
  const contact = await getContactByEmail(email);

  if (contact && !contact.portalUsername) {
    const { username, password } = await getUniqueUsernameAndPassword({
      firstName: contact.firstName,
      lastName: contact.lastName,
    });
    await createPortalUser({ username, password, salesforceId: contact.id });
    if (!contact.volunteerAgreement) {
      await updateContact(contact.id, {
        CK_Kitchen_Volunteer_Status__c: "Prospective",
      });
    }
  }

  return res.send(contact);
});

export default router;
