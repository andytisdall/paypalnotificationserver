import express from "express";
import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import {
  addContact,
  getContactByEmail,
  getContactById,
  updateContact,
} from "../../utils/salesforce/SFQuery/contact/contact";
import { updateHomeChefStatus } from "../../utils/salesforce/SFQuery/volunteer/homeChef";
import {
  formatFilesFromFileArray,
  uploadFileToSalesforce,
} from "../../utils/salesforce/SFQuery/files/fileUpload";
import { insertCampaignMember } from "../../utils/salesforce/SFQuery/volunteer/campaign/campaignMember";

const router = express.Router();

router.post("/food-handler", currentUser, requireAuth, async (req, res) => {
  const contact = await getContactById(req.currentUser!.salesforceId);
  if (req.files) {
    const fileList = formatFilesFromFileArray(req.files);
    if (fileList.length > 0) {
      fileList.forEach(
        async (file) => await uploadFileToSalesforce(contact, file),
      );
      await updateHomeChefStatus(contact, { foodHandler: true });
    }
  }
  res.send(null);
});

router.post("/orientation", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
  }: { firstName: string; lastName: string; email: string; phone: string } =
    req.body;

  let existingContact = await getContactByEmail(email);
  if (!existingContact) {
    existingContact = await addContact({
      FirstName: firstName,
      LastName: lastName,
      Phone: phone,
      Email: email,
    });
  } else {
    await updateContact(existingContact.id, {
      FirstName: firstName,
      LastName: lastName,
      Phone: phone,
    });
  }

  await insertCampaignMember({ ContactId: existingContact.id, CampaignId: "" });

  res.send(null);
});

export default router;
