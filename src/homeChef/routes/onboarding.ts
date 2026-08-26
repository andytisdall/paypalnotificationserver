import express from "express";
import { requireAuth } from "../../middlewares/require-auth";
import { getContactById } from "../../utils/salesforce/contact/getContact";
import { updateHomeChefStatus } from "../../utils/salesforce/volunteer/homeChef/updateStatus";
import {
  formatFilesFromFileArray,
  uploadFileToSalesforce,
} from "../../utils/salesforce/files/fileUpload";

const router = express.Router();

router.post("/food-handler", requireAuth, async (req, res) => {
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

export default router;
