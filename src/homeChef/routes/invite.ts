import express from "express";
import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { sendEmail, EmailMessage } from "../../utils/email/email";

const router = express.Router();

router.post("/invite", currentUser, requireAuth, async (req, res) => {
  const {
    recipients,
    message,
    subject,
  }: { recipients: string[]; message: string; subject: string } = req.body;
  const from = "mollye@ckoakland.org";

  const msg: EmailMessage = {
    html: `<p>${message.replace(/\n/g, "<p></p>")}</p>`,
    to: recipients.join(", "),
    from,
    subject,
  };
  await sendEmail(msg);
  res.sendStatus(204);
});

export default router;
