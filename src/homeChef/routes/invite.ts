import express from 'express';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { sendEmail, EmailMessage } from '../../utils/email';

const router = express.Router();

router.post('/invite', currentUser, requireAuth, async (req, res) => {
  const { recipients, message }: { recipients: string[]; message: string } =
    req.body;

  const subject = '';
  const from = 'mollye@ckoakland.org';

  const msg: EmailMessage = {
    text: message,
    to: recipients,
    from,
    subject,
  };
  await sendEmail(msg);
  res.sendStatus(204);
});

export default router;
