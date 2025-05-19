import express from "express";
import axios from "axios";

import fetcher from "../../utils/fetcher";
import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { getCampaign } from "../../utils/salesforce/SFQuery/volunteer/campaign/campaign";
import { getJobs } from "../../utils/salesforce/SFQuery/volunteer/jobs";
import { getShifts } from "../../utils/salesforce/SFQuery/volunteer/shifts";
import {
  getContactById,
  updateContact,
} from "../../utils/salesforce/SFQuery/contact";
import {
  formatFilesFromFileArray,
  uploadFileToSalesforce,
} from "../../utils/salesforce/SFQuery/files/fileUpload";
import urls from "../../utils/urls";
import getSecrets from "../../utils/getSecrets";
import { getDirections } from "../../utils/salesforce/googleApis/getDirections";

const router = express.Router();

router.get("/driver", currentUser, async (req, res) => {
  if (!req.currentUser) {
    return res.send(null);
  }
  const contact = await getContactById(req.currentUser.salesforceId);

  res.send({
    firstName: contact.FirstName,
    lastName: contact.LastName,
    licenseExpiration: contact.Driver_s_License_Expiration__c,
    volunteerAgreement: contact.CK_Kitchen_Agreement__c,
    car: contact.Car_Size__c,
    driverStatus: contact.Driver_Volunteer_Status__c,
  });
});

router.get("/driver/shifts", currentUser, requireAuth, async (req, res) => {
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
  const files = formatFilesFromFileArray(req.files);
  const contact = await getContactById(req.currentUser!.salesforceId);
  await uploadFileToSalesforce(contact, files[0]);

  // upload file
  await updateContact(contact.Id, {
    Driver_s_License_Expiration__c: expirationDate,
  });
  await checkAndUpdateDriverStatus(contact.Id);

  res.send(null);
});

router.post("/driver/insurance", currentUser, requireAuth, async (req, res) => {
  const { expirationDate } = req.body;
  if (!req.files) {
    throw Error("No image attached");
  }
  const files = formatFilesFromFileArray(req.files);
  const contact = await getContactById(req.currentUser!.salesforceId);
  await uploadFileToSalesforce(contact, files[0]);

  // upload file
  await updateContact(contact.Id, {
    Insurance_Expiration_Date__c: expirationDate,
  });
  await checkAndUpdateDriverStatus(contact.Id);

  res.send(null);
});

router.post("/driver/car", currentUser, requireAuth, async (req, res) => {
  const { size } = req.body;

  const contactId = req.currentUser!.salesforceId;

  await updateContact(contactId, { Car_Size__c: size });
  await checkAndUpdateDriverStatus(contactId);

  res.send(null);
});

router.get("/driver/cars", async (req, res) => {
  const { API_NINJA_KEY } = await getSecrets(["API_NINJA_KEY"]);
  const { data } = await axios.get(
    urls.ninja +
      "/catalog/datasets/all-vehicles-model/records?select=make,model,id&limit=100"
  );

  res.send(data.results);
});

router.get(
  "/driver/directions/:origin/:destination",
  currentUser,
  requireAuth,
  async (req, res) => {
    const { origin, destination } = req.params;
    const distance = await getDirections(origin, destination);
    res.send({ distance });
  }
);

export const checkAndUpdateDriverStatus = async (contactId: string) => {
  const contact = await getContactById(contactId);
  if (
    contact.Driver_s_License_Expiration__c &&
    new Date(contact.Driver_s_License_Expiration__c) > new Date() &&
    contact.Car_Size__c &&
    contact.CK_Kitchen_Agreement__c &&
    new Date(contact.Insurance_Expiration_Date__c!) > new Date()
  ) {
    await updateContact(contactId, { Driver_Volunteer_Status__c: "Active" });
  }
};

export default router;
