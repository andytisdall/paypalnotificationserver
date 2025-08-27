import express from "express";
import passwordGenerator from "generate-password";

import {
  getUniqueUsernameAndPassword,
  createPortalUser,
} from "../../auth/routes/user/createUser";
import {
  addContact,
  updateContact,
  getContactByLastNameAndEmail,
  getContactById,
} from "../../utils/salesforce/SFQuery/contact/contact";
import { UnformattedContact } from "../../utils/salesforce/SFQuery/contact/types";
import { insertCampaignMember } from "../../utils/salesforce/SFQuery/volunteer/campaign/campaignMember";
import { CampaignMemberObject } from "../../utils/salesforce/SFQuery/volunteer/campaign/types";
import mongoose from "mongoose";
import urls from "../../utils/urls";

const User = mongoose.model("User");
const router = express.Router();

export interface VolunteerInterestFormArgs {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  instagramHandle?: string;
  source: string;
  extraInfo?: string;
  corporate?: string;
}

router.post("/signup", async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    phoneNumber,
    instagramHandle,
    corporate,
    source,
    extraInfo,
  }: VolunteerInterestFormArgs = req.body;

  const contactInfo: Partial<UnformattedContact> = {
    FirstName: firstName,
    LastName: lastName,
    Email: email,
    HomePhone: phoneNumber,
    GW_Volunteers__Volunteer_Skills__c: "Cooking",
    GW_Volunteers__Volunteer_Notes__c: extraInfo,
    Instagram_Handle__c: instagramHandle,
    How_did_they_hear_about_CK__c: source,
    GW_Volunteers__Volunteer_Status__c: "Prospective",
    Home_Chef_Status__c: "Prospective",
    CK_Kitchen_Volunteer_Status__c: "Prospective",
    Interest_in_volunteering_group__c: corporate,
  };

  // find salesforce contact

  let existingContact = await getContactByLastNameAndEmail(lastName, email);

  // if not:
  // create salesforce contact
  if (!existingContact) {
    existingContact = await addContact({
      FirstName: firstName,
      LastName: lastName,
      Email: email,
    });
  }

  if (!existingContact) {
    throw Error("Unable to create contact");
  }

  const { username, password } = await getUniqueUsernameAndPassword({
    firstName: existingContact.firstName,
    lastName: existingContact.lastName,
  });

  const existingUser = await User.findOne({ salesforceId: existingContact.id });

  // create username and password
  if (!existingUser) {
    contactInfo.Portal_Username__c = username;
    (contactInfo.Portal_Temporary_Password__c = password),
      await createPortalUser({
        username,
        password,
        salesforceId: existingContact.id,
      });
  } else {
    // update user password to new temp password
    existingUser.password = password;
    existingUser.active = false;
    await existingUser.save();
  }

  if (corporate) {
    const campaignMember: CampaignMemberObject = {
      CampaignId: urls.corporateVolunteersCampaignId,
      ContactId: existingContact.id,
      Status: "Confirmed",
    };
    await insertCampaignMember(campaignMember);
  }

  // don't overwrite active vol status
  const unformattedContact = await getContactById(existingContact.id);
  if (unformattedContact.CK_Kitchen_Volunteer_Status__c === "Active") {
    contactInfo.CK_Kitchen_Volunteer_Status__c = "Active";
  }
  if (unformattedContact.Home_Chef_Status__c === "Active") {
    contactInfo.Home_Chef_Status__c = "Active";
  }

  await updateContact(existingContact.id, contactInfo);

  res.sendStatus(204);
});

export default router;
