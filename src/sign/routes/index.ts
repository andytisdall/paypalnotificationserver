import express from "express";

import { currentUser } from "../../middlewares/current-user";
import {
  getUnformattedContactByEmail,
  getContactById,
  updateContact,
} from "../../utils/salesforce/SFQuery/contact/contact";
import { UnformattedContact } from "../../utils/salesforce/SFQuery/contact/types";
import createSign from "../../utils/docMadeEasy/createSign";
import { uploadFileToSalesforce } from "../../utils/salesforce/SFQuery/files/fileUpload";
import downloadFile from "../../utils/docMadeEasy/downloadFile";
import { FileWithMetadata } from "../../utils/salesforce/SFQuery/files/metadata";
import getAccount from "../../utils/docMadeEasy/getAccount";
import { requireAuth } from "../../middlewares/require-auth";
import { sendEmail } from "../../utils/email/email";
import { updateHomeChefStatus } from "../../utils/salesforce/SFQuery/volunteer/homeChef";
import { checkAndUpdateDriverStatus } from "../../volunteers/routes/driver";

const router = express.Router();

interface DocWebhookBody {
  eventType: string;
  envelope: {
    id: string;
    recipients: { email: string }[];
    docName: string;
  };
}

export interface UserInfo {
  name: string;
  email: string;
  id: string;
}

type DocType = "HC" | "CKK";

export interface DocInformation {
  url: string;
  template: string;
  type: DocType;
  name: string;
}

interface WebhookBody {
  requests: {
    request_status: string;
    actions: { recipient_email: string }[];
    document_ids: { document_name: string; document_id: string }[];
    zsdocumentid: string;
  };
}

const docInfo: Record<string, DocInformation> = {
  HC: {
    type: "HC",
    url: "/home-chef/onboarding/sign/success",
    template: "C4smCqWwfs6cQqHnZLgnvRyw5D5Pmo1Cx",
    name: "CK Home Chef Volunteer Agreement",
  },
  CI: {
    type: "CKK",
    url: "/volunteer-check-in/confirm",
    template: "C4mpEu6sQgFfrLmivzFNjGa8FywTRskFV",
    name: "CK Kitchen Volunteer Agreement",
  },
  CKK: {
    type: "CKK",
    url: "/volunteers/sign/success",
    template: "C4mpEu6sQgFfrLmivzFNjGa8FywTRskFV",
    name: "CK Kitchen Volunteer Agreement",
  },
  DRV: {
    type: "CKK",
    url: "/volunteers/driver-onboarding/sign/success",
    template: "C4mpEu6sQgFfrLmivzFNjGa8FywTRskFV",
    name: "CK Kitchen Volunteer Agreement",
  },
};

router.post("/update-contact1", async (req, res) => {
  const { requests }: WebhookBody = req.body;
  const { request_status, actions, document_ids, zsdocumentid } = requests;

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

  const data = await downloadFile(zsdocumentid);

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

router.get("/config", async (req, res) => {
  const account = await getAccount();

  const limitReached = account.apiSigns > 39;

  res.send({ limitReached });
});

router.get(
  "/emailAgreement/:doc",
  currentUser,
  requireAuth,
  async (req, res) => {
    const { doc } = req.params;
    const contact = await getContactById(req.currentUser!.salesforceId);

    const emailText = `${contact.FirstName} ${contact.LastName} has requested a ${doc} volunteer agreement and the API limit has been reached for the month, so you have to email it to them. ID: ${contact.Id}`;

    await sendEmail({
      html: emailText,
      to: "andy@ckoakland.org",
      from: "andy@ckoakland.org",
      subject: "volunteer agreement requested",
    });

    res.send(null);
  }
);

router.get(
  "/:docType?/:hoursId?/:contactId?",
  currentUser,
  async (req, res) => {
    const { docType, contactId, hoursId } = req.params as {
      docType?: DocType;
      contactId?: string;
      hoursId?: string;
    };

    let contact: UnformattedContact | undefined;

    if (!req.currentUser && !contactId) {
      throw Error("Request must have a user or pass info into the URL");
    }

    if (!docType || !docInfo[docType]) {
      throw Error("Invalid document requested");
    }

    if (contactId) {
      contact = await getContactById(contactId);
      if (!contact) {
        throw Error("Invalid Contact Id");
      }
    } else if (req.currentUser) {
      contact = await getContactById(req.currentUser.salesforceId);
    }

    if (!contact) {
      throw Error("Contact Not Found");
    }
    if (!contact.Email) {
      throw Error(
        "Contact has no email, which is required for document signing"
      );
    }

    const doc = docInfo[docType];

    // check if doc is signed and return early
    const homeChefAlreadySigned =
      contact.Home_Chef_Volunteeer_Agreement__c && docType === "HC";
    const kitchenAlreadySigned =
      contact.CK_Kitchen_Agreement__c && doc.type === "CKK";

    if (homeChefAlreadySigned || kitchenAlreadySigned) {
      return res.send({ signingUrl: "" });
    }

    const signingUrl = await createSign({
      contact: { name: contact.Name, email: contact.Email, id: contact.Id },
      doc,
      hoursId,
    });
    res.send({ signingUrl });
  }
);

router.post("/update-contact", async (req, res) => {
  const { envelope, eventType }: DocWebhookBody = req.body;

  if (eventType !== "envelope_signed") {
    return res.sendStatus(200);
  }

  const contact = await getUnformattedContactByEmail(
    envelope.recipients[0].email
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

  res.sendStatus(200);
});

export default router;
