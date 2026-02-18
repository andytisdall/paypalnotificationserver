import express from "express";

import { currentUser } from "../../../middlewares/current-user";
import { getContactById } from "../../../utils/salesforce/SFQuery/contact/contact";
import {
  getHour,
  deleteVolunteerHours,
} from "../../../utils/salesforce/SFQuery/volunteer/hours";
import { getCampaignFromHours } from "../../../utils/salesforce/SFQuery/volunteer/campaign/campaign";
import { sendShiftCancelEmail } from "../../../utils/email/emailTemplates/kitchenShiftCancel";
import { getJobFromHours } from "../../../utils/salesforce/SFQuery/volunteer/jobs";

const router = express.Router();

router.delete("/hours/:id{/:salesforceId}", currentUser, async (req, res) => {
  const id = req.params.id as string;
  const salesforceId = req.params.salesforceId as string;

  let contactId = "";
  if (req.currentUser) {
    contactId = req.currentUser.salesforceId;
  } else {
    contactId = salesforceId;
  }

  if (!contactId) {
    throw Error("Could not find contact");
  }

  await deleteVolunteerHours(id);
  sendVolunteerShiftCancelEmail({ contactId, hoursId: id });

  res.sendStatus(204);
});

export const sendVolunteerShiftCancelEmail = async ({
  contactId,
  hoursId,
}: {
  contactId: string;
  hoursId: string;
}) => {
  const campaign = await getCampaignFromHours(hoursId);
  const hour = await getHour(hoursId);
  const { Email, FirstName } = await getContactById(contactId);
  const job = await getJobFromHours(hour.job);

  if (Email && campaign) {
    await sendShiftCancelEmail(Email, {
      date: hour.time,
      name: FirstName,
      campaign: campaign.name,
      job: job.Name,
    });
  }
};

export default router;
