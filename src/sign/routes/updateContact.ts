import express from "express";

import {
  getUnformattedContactByEmail,
  updateContact,
} from "../../utils/salesforce/SFQuery/contact/contact";
import { uploadFileToSalesforce } from "../../utils/salesforce/SFQuery/files/fileUpload";
import { FileWithMetadata } from "../../utils/salesforce/SFQuery/files/metadata";
import { downloadFile } from "../../utils/zoho/downloadFile";
import { updateHomeChefStatus } from "../../utils/salesforce/SFQuery/volunteer/homeChef";
import { checkAndUpdateDriverStatus } from "../../volunteers/routes/driver";
import { docInfo } from "./createAgreement";

const router = express.Router();

interface WebhookBody {
  requests: {
    request_status: string;
    actions: { recipient_email: string }[];
    document_ids: { document_name: string; document_id: string }[];
    request_id: string;
  };
}

router.post("/update-contact", async (req, res) => {
  const { requests }: WebhookBody = req.body;
  const { request_status, actions, document_ids, request_id } = requests;

  if (request_status !== "completed") {
    return res.sendStatus(200);
  }

  const contact = await getUnformattedContactByEmail(
    actions[0].recipient_email
  );

  const doc = Object.values(docInfo).find(
    (d) => d.name === document_ids[0].document_name
  );

  if (!contact) {
    throw Error("Could not get contact");
  }

  if (!doc) {
    throw Error();
  }

  const data = await downloadFile(request_id);

  const file: FileWithMetadata = {
    docType: doc.type,
    file: {
      name: doc.name + ".pdf",
      data: Buffer.from(data),
    },
  };

  await uploadFileToSalesforce(contact, file);

  if (doc.type === "CKK") {
    await updateContact(contact.Id, {
      CK_Kitchen_Agreement__c: true,
      CK_Kitchen_Volunteer_Status__c: "Active",
    });
    await checkAndUpdateDriverStatus(contact.Id);
  }

  if (doc.type === "HC") {
    await updateHomeChefStatus(contact, { agreement: true });
  }

  res.sendStatus(200);
});

export default router;
