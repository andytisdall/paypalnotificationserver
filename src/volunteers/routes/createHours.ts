import express from "express";

import { createHours } from "../../utils/salesforce/SFQuery/volunteer/hours";
import {
  getContactByEmail,
  addContact,
  getContact,
} from "../../utils/salesforce/SFQuery/contact";
import urls from "../../utils/urls";
// import { createRecurringHours } from '../../utils/salesforce/SFQuery/volunteer/ckKitchen';

const router = express.Router();

router.post("/hours", async (req, res) => {
  const {
    shiftId,
    jobId,
    date,
    contactSalesforceId,
  }: {
    shiftId: string;
    jobId: string;
    date: string;
    contactSalesforceId: string;
  } = req.body;

  const hours = await createHours({
    contactId: contactSalesforceId,
    shiftId,
    jobId,
    date,
  });

  res.status(201);
  res.send(hours);
});

router.post("/hours/cookies", async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    phone,
    numberOfVolunteers,
  }: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    numberOfVolunteers: number;
  } = req.body;

  let contact = await getContactByEmail(email);
  if (!contact) {
    contact = await getContact(lastName, firstName);
  }
  if (!contact) {
    contact = await addContact({
      Email: email,
      FirstName: firstName,
      LastName: lastName,
      HomePhone: phone,
      CK_Kitchen_Volunteer_Status__c: "Prospective",
      GW_Volunteers__Volunteer_Status__c: "Prospective",
    });
  }

  if (!contact) {
    throw Error("could not get contact");
  }

  await createHours({
    contactId: contact.id!,
    shiftId: urls.cookieShiftId,
    jobId: urls.cookieJobId,
    date: urls.cookieDate,
    numberOfVolunteers,
  });

  res.sendStatus(204);
});

// router.post('/recurring-hours', async (req, res) => {
//   const { contactId, dayOfWeek } = req.body;

//   await createRecurringHours({ contactId, dayOfWeek });

//   res.send(null);
// });

export default router;
