import express from "express";

import { currentUser } from "../../middlewares/current-user";
import { getContactById } from "../../utils/salesforce/SFQuery/contact/contact";
import { UnformattedContact } from "../../utils/salesforce/SFQuery/contact/types";

import { createRequest } from "../../utils/zoho/sign";

const router = express.Router();

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

export const docInfo: Record<string, DocInformation> = {
  HC: {
    type: "HC",
    url: "/home-chef/onboarding/sign/success",
    template: "489948000000041011",
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

    const signingUrl = await createRequest({
      contact: { name: contact.Name, email: contact.Email, id: contact.Id },
      doc,
      hoursId,
    });
    // create
    res.send({ signingUrl });
  }
);

export default router;
