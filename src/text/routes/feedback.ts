import express from "express";
import mongoose from "mongoose";
import { subDays } from "date-fns";

import { FeedbackObject } from "../types";
import { sendEmail } from "../../utils/email/email";
import { requireAdmin } from "../../middlewares/require-admin";

const Feedback = mongoose.model("Feedback");
const router = express.Router();

export const receiveFeedback = async (feedbackArgs: FeedbackObject) => {
  const newFeedback = new Feedback(feedbackArgs);
  await newFeedback.save();
  await sendFBNotification(feedbackArgs);
};

export const sendFBNotification = async (feedbackArgs: FeedbackObject) => {
  const html = `
  <p>You received feedback through the CK Text Service:</p>
  <p><b>Message:</b> ${feedbackArgs.message}</p>
  <p><b>From:</b> ${feedbackArgs.sender}</p>
  <p><b>Region:</b> ${feedbackArgs.region}</p>
  `;

  const RECIPIENT = "kenai@ckoakland.org";
  const SUBJECT = "CK Text Service: You received feedback";
  await sendEmail({
    to: RECIPIENT,
    from: RECIPIENT,
    subject: SUBJECT,
    html,
    mediaUrl: feedbackArgs.images,
  });
};

router.get("/feedback/:daysBack", requireAdmin, async (req, res) => {
  const { daysBack } = req.params;
  const startDate = subDays(new Date(), parseInt(daysBack));

  const allFeedback =
    daysBack === "all"
      ? await Feedback.find()
      : await Feedback.find({ date: { $gte: startDate } });

  res.send(allFeedback);
});

router.patch("/feedback/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const feedback = await Feedback.findById(id);
  if (!feedback) {
    throw Error("Could not find feedback");
  }
  feedback.read = true;
  await feedback.save();
  res.send(feedback);
});

router.delete("/feedback/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  await Feedback.deleteOne({ _id: id });
  res.send(id);
});

export default router;
