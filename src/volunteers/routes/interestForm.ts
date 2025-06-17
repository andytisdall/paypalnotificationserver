import express from "express";
import passwordGenerator from "generate-password";

import {
  addContact,
  updateContact,
  getContactByLastNameAndEmail,
} from "../../utils/salesforce/SFQuery/contact/contact";
import { UnformattedContact } from "../../utils/salesforce/SFQuery/contact/types";
import { insertCampaignMember } from "../../utils/salesforce/SFQuery/volunteer/campaign/campaignMember";
import { CampaignMemberObject } from "../../utils/salesforce/SFQuery/volunteer/campaign/types";
import mongoose from "mongoose";
import urls from "../../utils/urls";

const User = mongoose.model("User");
const router = express.Router();

interface VolunteerPrograms {
  ckKitchen: boolean;
  ckHomeChefs: boolean;
  corporate: boolean;
  other: string;
}

export interface VolunteerInterestFormArgs {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  instagramHandle?: string;
  foodHandler?: boolean;
  foodHandlerOther?: string;
  experience?: string;
  transport?: boolean;
  transportOther?: string;
  workOnFeet?: boolean;
  workOnFeetOther?: string;
  source: string;
  extraInfo?: string;
  programs: VolunteerPrograms;
}

const insertCampaignMembers = async (
  programs: VolunteerPrograms,
  contactId: string
) => {
  if (programs.corporate) {
    const campaignMember: CampaignMemberObject = {
      CampaignId: urls.corporateVolunteersCampaignId,
      ContactId: contactId,
      Status: "Confirmed",
    };
    await insertCampaignMember(campaignMember);
  }
};

const createPortalUser = async ({
  username,
  password,
  salesforceId,
}: {
  username: string;
  password: string;
  salesforceId: string;
}) => {
  const newUser = new User({
    username,
    password,
    salesforceId,
  });
  await newUser.save();
};

const createUniqueUsername = async (firstName: string, lastName: string) => {
  const username = (
    firstName.charAt(0).toLowerCase() + lastName.toLowerCase()
  ).replace(" ", "");

  let uniqueUsername = username;
  let existingUser = await User.findOne({ username });
  let i = 1;
  while (existingUser) {
    uniqueUsername = username + i;
    existingUser = await User.findOne({ username: uniqueUsername });
    i++;
  }

  return uniqueUsername;
};

router.post("/signup", async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    phoneNumber,
    instagramHandle,
    foodHandler,
    foodHandlerOther,
    experience,
    transport,
    transportOther,
    workOnFeet,
    workOnFeetOther,
    source,
    extraInfo,
    programs,
  }: VolunteerInterestFormArgs = req.body;

  const temporaryPassword = passwordGenerator.generate({
    length: 10,
    numbers: true,
  });

  const contactInfo: Partial<UnformattedContact> = {
    FirstName: firstName,
    LastName: lastName,
    Email: email,
    HomePhone: phoneNumber,
    GW_Volunteers__Volunteer_Skills__c: "Cooking",
    GW_Volunteers__Volunteer_Notes__c: extraInfo,
    Instagram_Handle__c: instagramHandle,
    Able_to_get_food_handler_cert__c: foodHandler,
    Cooking_Experience__c: experience,
    How_did_they_hear_about_CK__c: source,
    Able_to_get_food_handler_other__c: foodHandlerOther,
    Able_to_work_on_feet__c: workOnFeet,
    Able_to_work_on_feet_other__c: workOnFeetOther,
    Able_to_Commit__c: transport,
    Able_to_cook_and_transport_other__c: transportOther,
    GW_Volunteers__Volunteer_Status__c: "Prospective",
    Portal_Temporary_Password__c: temporaryPassword,
  };

  if (programs.other) {
    contactInfo.Interest_in_other_volunteer_programs__c = programs.other;
  }

  contactInfo.Home_Chef_Status__c = "Prospective";
  contactInfo.CK_Kitchen_Volunteer_Status__c = "Prospective";

  const uniqueUsername = await createUniqueUsername(firstName, lastName);

  // find salesforce contact

  let existingContact = await getContactByLastNameAndEmail(lastName, email);

  // if not:
  // create salesforce contact
  if (!existingContact) {
    existingContact = await addContact({ LastName: lastName, Email: email });
  }

  // create username and password
  if (!existingContact.portalUsername) {
    contactInfo.Portal_Username__c = uniqueUsername;
    await createPortalUser({
      username: uniqueUsername,
      password: temporaryPassword,
      salesforceId: existingContact.id,
    });
  } else {
    // update user password to new temp password
    await User.updateOne(
      { username: existingContact.portalUsername },
      { password: temporaryPassword, active: false }
    );
  }

  await updateContact(existingContact.id, contactInfo);
  await insertCampaignMembers(programs, existingContact.id);

  res.sendStatus(204);
});

export default router;
