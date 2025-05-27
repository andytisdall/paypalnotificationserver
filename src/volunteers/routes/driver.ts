import express from "express";
import axios from "axios";

import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import {
  getContactById,
  updateContact,
} from "../../utils/salesforce/SFQuery/contact/contact";
import {
  formatFilesFromFileArray,
  uploadFileToSalesforce,
} from "../../utils/salesforce/SFQuery/files/fileUpload";
import urls from "../../utils/urls";
import getSecrets from "../../utils/getSecrets";

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

router.get("/driver/makes", async (req, res) => {
  const { data } = await axios.get(
    urls.ninja +
      "/catalog/datasets/all-vehicles-model/records?select=make&group_by=make&limit=100"
  );

  res.send(data.results);
});

router.get("/driver/models/:make", async (req, res) => {
  const { make } = req.params;
  const { data } = await axios.get(
    urls.ninja +
      `/catalog/datasets/all-vehicles-model/records?select=model&where=make%3D'${make}'&group_by=model&limit=100`
  );

  res.send(data.results);
});

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
