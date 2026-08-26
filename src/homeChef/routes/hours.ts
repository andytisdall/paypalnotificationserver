import express from "express";
import { CreateHoursParams } from "../../utils/salesforce/volunteer/types";

import { requireAuth } from "../../middlewares/require-auth";
import fetcher from "../../utils/fetcher";
import urls from "../../utils/urls";
import { getHours } from "../../utils/salesforce/volunteer/hours/getHours";
import { createHours } from "../../utils/salesforce/volunteer/hours/createHours";
import { editHours } from "../../utils/salesforce/volunteer/hours/editHours";
import { getContactById } from "../../utils/salesforce/contact/getContact";
import { sendHomeChefShiftEditEmail } from "../../utils/email/emailTemplates/homeChefShiftEdit";

const router = express.Router();

router.get("/hours", requireAuth, async (req, res) => {
  await fetcher.setService("salesforce");
  const id = req.currentUser!.salesforceId;
  const hours = await getHours(urls.townFridgeCampaignId, id);
  res.send(hours);
});

router.post("/hours", requireAuth, async (req, res) => {
  const { mealCount, shiftId, jobId, date, soup }: CreateHoursParams = req.body;

  const salesforceId = req.currentUser!.salesforceId;
  if (!salesforceId) {
    throw Error("User does not have a salesforce ID");
  }
  const hours = await createHours({
    contactId: salesforceId,
    mealCount,
    shiftId,
    jobId,
    date,
    soup,
  });

  res.status(201);
  res.send(hours);
});

router.patch("/hours/:id", requireAuth, async (req, res) => {
  const id = req.params.id as string;
  const {
    mealCount,
    cancel,
    emailData,
    mealType,
  }: {
    mealCount: number;
    cancel: boolean;
    emailData: { fridge: string; date: string };
    mealType: "Entree" | "Soup";
  } = req.body;

  await editHours({
    mealCount,
    status: cancel ? "Canceled" : undefined,
    id,
    mealType,
  });
  // opp is updated by a salesforce flow

  // email user confirmation
  // get user email, date of shift, and fridge name
  const { Email } = await getContactById(req.currentUser!.salesforceId);
  // email user confirmation
  if (Email) {
    await sendHomeChefShiftEditEmail(Email, {
      date: emailData.date,
      fridge: emailData.fridge,
      cancel,
      mealCount,
      mealType,
    });
  }

  res.send({ id, mealCount, cancel });
});

export default router;
