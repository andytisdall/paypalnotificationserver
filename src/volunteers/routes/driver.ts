import express from "express";

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
import { FormattedContact } from "../../utils/salesforce/SFQuery/contact/types";

const router = express.Router();

router.get("/driver", currentUser, async (req, res) => {
  if (!req.currentUser) {
    return res.send(null);
  }
  const contact = await getContactById(req.currentUser.salesforceId);
  const formattedContact: Partial<FormattedContact> = {
    licenseExpiration: contact.Driver_s_License_Expiration__c,
    insuranceExpiration: contact.Insurance_Expiration_Date__c,
    volunteerAgreement: contact.CK_Kitchen_Agreement__c,
    car: {
      size: contact.Car_Size__c,
      make: contact.Car_Make__c,
      model: contact.Car_Model__c,
      year: contact.Car_Year__c,
      color: contact.Car_Color__c,
    },
    driverStatus: contact.Driver_Volunteer_Status__c,
  };

  res.send(formattedContact);
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
  const { size, make, model, year, color } = req.body;

  const contactId = req.currentUser!.salesforceId;

  await updateContact(contactId, {
    Car_Size__c: size,
    Car_Make__c: size !== "Bike" ? make : "",
    Car_Model__c: size !== "Bike" ? model : "",
    Car_Year__c: size !== "Bike" ? year : "",
    Car_Color__c: size !== "Bike" ? color : "",
  });
  await checkAndUpdateDriverStatus(contactId);

  res.send(null);
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
