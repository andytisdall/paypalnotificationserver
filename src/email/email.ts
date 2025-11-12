import express from "express";

import { requireSalesforceAuth } from "../middlewares/require-salesforce-auth";
import { sendEmail } from "../utils/email/email";

const router = express.Router();

router.post("/email", requireSalesforceAuth, async (req, res) => {
  const { emailText, emailAddress, fromEmail, subject } = req.body;

  await sendEmail({
    html: emailText,
    to: emailAddress,
    from: fromEmail,
    subject,
    bcc: "kenai@ckoakland.org",
  });

  res.send({ success: true });
});

export default router;
