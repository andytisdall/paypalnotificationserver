import express from "express";

import { currentUser } from "../../middlewares/current-user";
import { getContactById } from "../../utils/salesforce/contact/getContact";
import { UnformattedContact } from "../../utils/salesforce/contact/types";
import { docInfo } from "../docConfig";
import { createSign } from "../../utils/docMadeEasy/createSign";
import { SignArgs, SignResponse } from "@community-kitchens/apiinterfaces";

const router = express.Router();

router.get("/{:doc}{/:contactId}{/:hoursId}", currentUser, async (req, res) => {
  const { doc, contactId, hoursId } = req.params as SignArgs;

  let contact: UnformattedContact | undefined;

  if (!req.currentUser && !contactId) {
    throw Error("Request must have a user or pass info into the URL");
  }

  if (!doc || !docInfo[doc]) {
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
    throw Error("Contact has no email, which is required for document signing");
  }

  const document = docInfo[doc];

  // check if doc is signed and return early
  const homeChefAlreadySigned =
    contact.Home_Chef_Volunteeer_Agreement__c && doc === "HC";
  const kitchenAlreadySigned =
    contact.CK_Kitchen_Agreement__c && document.type === "CKK";

  if (homeChefAlreadySigned || kitchenAlreadySigned) {
    return res.send({ signingUrl: "" });
  }

  const signingUrl = await createSign({
    contact: { name: contact.Name, email: contact.Email, id: contact.Id },
    doc: document,
    hoursId,
  });

  const response: SignResponse = { signingUrl };

  res.send(response);
});

export default router;
