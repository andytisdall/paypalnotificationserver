import express from "express";

import { currentUser } from "../../middlewares/current-user";
import {
  getUnformattedContactByEmail,
  getContactById,
  updateContact,
} from "../../utils/salesforce/SFQuery/contact/contact";
import { UnformattedContact } from "../../utils/salesforce/SFQuery/contact/types";
import { uploadFileToSalesforce } from "../../utils/salesforce/SFQuery/files/fileUpload";
import downloadFile from "../../utils/docMadeEasy/downloadFile";
import { FileWithMetadata } from "../../utils/salesforce/SFQuery/files/metadata";
import getAccount from "../../utils/docMadeEasy/getAccount";
import { requireAuth } from "../../middlewares/require-auth";
import { sendEmail } from "../../utils/email/email";
import { updateHomeChefStatus } from "../../utils/salesforce/SFQuery/volunteer/homeChef";
import { checkAndUpdateDriverStatus } from "../../volunteers/routes/driver";
import { createRequest } from "../../utils/zoho/sign";

const router = express.Router();

interface UpdateContactBody {}

router.post("/update-contact", async (req, res) => {
  console.log(req.body);
  res.send(null);
});

// router.post("/update-contact", async (req, res) => {
//   const { envelope, eventType }: DocWebhookBody = req.body;

//   if (eventType !== "envelope_signed") {
//     return res.sendStatus(200);
//   }

//   const contact = await getUnformattedContactByEmail(
//     envelope.recipients[0].email
//   );

//   const doc = Object.values(docInfo).find((d) => d.name === envelope.docName);

//   if (!contact) {
//     throw Error("Could not get contact");
//   }

//   if (!doc) {
//     throw Error();
//   }

// const data = await downloadFile(envelope.id);

//   const file: FileWithMetadata = {
//     docType: doc.type,
//     file: {
//       name: doc.name + ".pdf",
//       data: Buffer.from(data),
//     },
//   };

//   await uploadFileToSalesforce(contact, file);

//   if (doc.type === "CKK") {
//     await updateContact(contact.Id, {
//       CK_Kitchen_Agreement__c: true,
//       CK_Kitchen_Volunteer_Status__c: "Active",
//     });
//     await checkAndUpdateDriverStatus(contact.Id);
//   }

//   if (doc.type === "HC") {
//     await updateHomeChefStatus(contact, { agreement: true });
//   }

//   res.sendStatus(200);
// });

export default router;
