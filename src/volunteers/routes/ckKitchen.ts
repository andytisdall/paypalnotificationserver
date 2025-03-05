import express from "express";
import { formatISO } from "date-fns";

import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { requireAdmin } from "../../middlewares/require-admin";
import {
  checkInVolunteer,
  getKitchenVolunteers,
  getTodaysKitchenShifts,
} from "../../utils/salesforce/SFQuery/volunteer/ckKitchen";
import {
  getContactByEmail,
  addContact,
} from "../../utils/salesforce/SFQuery/contact";
import { createHours } from "../../utils/salesforce/SFQuery/volunteer/hours";

import {
  addSlotToShift,
  getShift,
} from "../../utils/salesforce/SFQuery/volunteer/shifts";
import { sendEmail } from "../../utils/email";
import { insertCampaignMember } from "../../utils/salesforce/SFQuery/volunteer/campaign/campaignMember";
import urls from "../../utils/urls";

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

router.get(
  "/check-in/shifts",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const shifts = await getTodaysKitchenShifts();
    res.send(shifts);
  }
);

router.get(
  "/check-in/:shiftId",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { shiftId } = req.params;
    const contacts = await getKitchenVolunteers(shiftId);
    res.send(contacts);
  }
);

router.post(
  "/check-in",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { hoursId }: { hoursId: string } = req.body;

    await checkInVolunteer(hoursId);

    res.sendStatus(204);
  }
);

router.post(
  "/check-in/hours",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { contactId, shiftId }: { contactId: string; shiftId: string } =
      req.body;

    // must change desired # of volunteers if the shift is full, otherwise it can't create the hours

    const shift = await getShift(shiftId);
    if (!shift) {
      throw Error("Shift not found");
    }
    if (!shift.open) {
      await addSlotToShift(shift);
    }

    await createHours({
      shiftId,
      contactId,
      jobId: shift.job,
      date: formatISO(new Date()),
    });

    res.sendStatus(204);
  }
);

router.post("/doorfront", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    daysAvailable,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    daysAvailable: string[];
  } = req.body;

  let contact = await getContactByEmail(email);
  if (!contact) {
    contact = await addContact({
      FirstName: firstName,
      LastName: lastName,
      Email: email,
    });
  }

  if (contact) {
    await insertCampaignMember({
      CampaignId: urls.frontDoorCampaignId,
      ContactId: contact.id,
      Status: "Prospect",
    });
  }

  const body = `
  <p>This info was submitted through the doorfront volunteer signup form:</p>
  <ul>
  <li>
  Name: ${firstName} ${lastName}
  </li>
  <li>
  email: ${email}
  </li>
  <li>
  Days Available: ${daysAvailable.map((day) => `${day} `)}
  </li>
  </ul>
  <p>A list of people who have filled out this form is <a href="https://communitykitchens.lightning.force.com/lightning/r/Campaign/701UP00000JdCfxYAF/view">here.</a></p>
  `;

  await sendEmail({
    html: body,
    subject: "Someone submitted a doorfront volunteer form!",
    to: "kenai@ckoakland.org",
    from: "andy@ckoakland.org",
  });

  // email kenai

  res.send(null);
});

export default router;
