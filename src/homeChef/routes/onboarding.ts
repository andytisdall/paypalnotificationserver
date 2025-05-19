import express from "express";
import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { getContactById } from "../../utils/salesforce/SFQuery/contact/contact";
import { updateHomeChefStatus } from "../../utils/salesforce/SFQuery/volunteer/homeChef";
import {
  formatFilesFromFileArray,
  uploadFileToSalesforce,
} from "../../utils/salesforce/SFQuery/files/fileUpload";

const router = express.Router();

router.post("/food-handler", currentUser, requireAuth, async (req, res) => {
  const contact = await getContactById(req.currentUser!.salesforceId);
  if (req.files) {
    const fileList = formatFilesFromFileArray(req.files);
    if (fileList.length > 0) {
      fileList.forEach(
        async (file) => await uploadFileToSalesforce(contact, file)
      );
      await updateHomeChefStatus(contact, { foodHandler: true });
    }
  }
  res.send(null);
});

export default router;
