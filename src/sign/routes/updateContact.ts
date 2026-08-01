import express from "express";

import { getUnformattedContactByEmail } from "../../utils/salesforce/contact/getContact";
import { updateContact } from "../../utils/salesforce/contact/updateContact";
import { uploadFileToSalesforce } from "../../utils/salesforce/files/fileUpload";
import { FileWithMetadata } from "../../utils/salesforce/files/metadata";
import { updateHomeChefStatus } from "../../utils/salesforce/volunteer/homeChef/updateStatus";
import { checkAndUpdateDriverStatus } from "../../volunteers/routes/driver";
import { docInfo } from "../docConfig";
import { downloadFile } from "../../utils/docMadeEasy/downloadFile";

const router = express.Router();

export interface DocWebhookBody {
  eventType: string;
  envelope: {
    id: string;
    recipients: { email: string }[];
    docName: string;
  };
}

router.post("/update-contact", async (req, res) => {
  const { envelope, eventType }: DocWebhookBody = req.body;

  if (eventType !== "envelope_signed") {
    return res.sendStatus(200);
  }

  const contact = await getUnformattedContactByEmail(
    envelope.recipients[0].email,
  );

  const doc = Object.values(docInfo).find((d) => d.name === envelope.docName);

  if (!contact) {
    throw Error("Could not get contact");
  }

  if (!doc) {
    throw Error();
  }

  const data = await downloadFile(envelope.id);

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

  res.sendStatus(204);
});

export default router;
