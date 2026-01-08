import express from "express";

import { requireSalesforceAuth } from "../middlewares/require-salesforce-auth";
import { sendBatchEmail, sendEmail } from "../utils/email/email";

const router = express.Router();

router.post("/email", requireSalesforceAuth, async (req, res) => {
  const {
    emailText,
    emailAddress,
    fromEmail,
    subject,
  }: {
    emailText: string;
    emailAddress: string;
    fromEmail: string;
    subject: string;
  } = req.body;

  if (emailAddress.includes(",")) {
    const emailArray = emailAddress.split(",");
    await sendBatchEmail({
      to: emailArray,
      subject,
      from: fromEmail,
      html: emailText,
    });
  } else {
    await sendEmail({
      html: emailText,
      to: emailAddress,
      from: fromEmail,
      subject,
      bcc: "kenai@ckoakland.org",
    });
  }

  res.send({ success: true });
});

export default router;
