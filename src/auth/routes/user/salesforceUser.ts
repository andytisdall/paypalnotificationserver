import express from "express";
import mongoose from "mongoose";

import { currentUser } from "../../../middlewares/current-user";
import { getContactById } from "../../../utils/salesforce/SFQuery/contact/contact";
import { FormattedContact } from "../../../utils/salesforce/SFQuery/contact/types";
import { requireSalesforceAuth } from "../../../middlewares/require-salesforce-auth";
import { createPortalUser, getUniqueUsernameAndPassword } from "./createUser";

const User = mongoose.model("User");

const router = express.Router();

router.get("/userInfo", currentUser, async (req, res) => {
  // fail silently so users don't get an error on volunteer page
  if (!req.currentUser) {
    return res.sendStatus(204);
  }
  if (!req.currentUser!.salesforceId) {
    throw Error("User does not have a salesforce ID");
  }
  const contact = await getContactById(req.currentUser!.salesforceId);
  const contactInfo: Pick<
    FormattedContact,
    | "firstName"
    | "lastName"
    | "homeChefAgreement"
    | "foodHandler"
    | "homeChefQuizPassed"
    | "homeChefStatus"
    | "volunteerAgreement"
    | "ckKitchenStatus"
  > = {
    firstName: contact.FirstName,
    lastName: contact.LastName,
    homeChefAgreement: contact.Home_Chef_Volunteeer_Agreement__c,
    foodHandler: contact.Home_Chef_Food_Handler_Certification__c,
    homeChefQuizPassed: contact.Home_Chef_Quiz_Passed__c,
    homeChefStatus: contact.Home_Chef_Status__c,
    volunteerAgreement: contact.CK_Kitchen_Agreement__c,
    ckKitchenStatus: contact.CK_Kitchen_Volunteer_Status__c,
  };
  res.send(contactInfo);
});

// route for salesforce flow to create portal user
router.post("/salesforce", requireSalesforceAuth, async (req, res) => {
  const {
    firstName,
    lastName,
    id,
  }: { firstName?: string; lastName: string; id: string } = req.body;

  const existingUser = await User.findOne({ salesforceId: id });

  const { username, password } = await getUniqueUsernameAndPassword({
    firstName,
    lastName,
  });

  if (existingUser) {
    existingUser.password = password;
    await existingUser.save();
    return res.send({
      username: existingUser.username,
      password,
    });
  }

  await createPortalUser({
    username,
    password,
    salesforceId: id,
  });

  res.status(201).send({ username, password });
});

export default router;
