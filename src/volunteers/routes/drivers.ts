import express from "express";

import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { getCampaign } from "../../utils/salesforce/SFQuery/volunteer/campaign/campaign";
import { getJobs } from "../../utils/salesforce/SFQuery/volunteer/jobs";
import { getShifts } from "../../utils/salesforce/SFQuery/volunteer/shifts";
import {
  FormattedContact,
  getContactById,
  updateContact,
} from "../../utils/salesforce/SFQuery/contact";

const router = express.Router();

router.get("/driver", currentUser, requireAuth, async (req, res) => {
  const campaign = await getCampaign("");

  const jobs = await getJobs(campaign.id);
  const shiftPromises = jobs.map(async (j) => {
    const shifts = await getShifts(j.id, 42);
    j.shifts = shifts.map((sh) => sh.id);
    return shifts;
  });
  const shifts = (await Promise.all(shiftPromises)).flat();

  res.send({ jobs, shifts, ...campaign });
});

router.post("/driver/license", currentUser, requireAuth, async (req, res) => {
  const { expirationDate } = req.body;
  if (!req.files) {
    throw Error("No image attached");
  }
  const image = req.files[0];

  const contactId = req.currentUser!.id;

  // upload file
  await updateContact(contactId, {
    Driver_s_License_Expiration__c: expirationDate,
  });
  await checkAndUpdateDriverStatus(contactId);

  res.send(null);
});

router.post("/driver/car", currentUser, requireAuth, async (req, res) => {
  const { carSize } = req.body;

  const contactId = req.currentUser!.id;

  await updateContact(contactId, { Car_Size__c: carSize });
  await checkAndUpdateDriverStatus(contactId);

  res.send(null);
});

const checkAndUpdateDriverStatus = async (contactId: string) => {
  const contact = await getContactById(contactId);
  if (
    contact.Driver_s_License_Expiration__c &&
    new Date(contact.Driver_s_License_Expiration__c) > new Date() &&
    contact.Car_Size__c
  ) {
    await updateContact(contactId, { Driver_Volunteer_Status__c: "Active" });
  }
};
