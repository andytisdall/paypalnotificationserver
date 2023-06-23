import express from 'express';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import fetcher from '../../utils/fetcher';
import urls from '../../utils/urls';
import {
  getContactById,
  getHours,
  createHours,
  editHours,
} from '../../utils/salesforce/SFQuery';
import { sendShiftEditEmail } from '../../utils/email';

const router = express.Router();

router.get('/hours', currentUser, requireAuth, async (req, res) => {
  await fetcher.setService('salesforce');
  const id = req.currentUser!.salesforceId;
  const hours = await getHours(urls.townFridgeCampaignId, id);
  res.send(hours);
});

interface HoursPostParams {
  mealCount: number;
  shiftId: string;
  jobId: string;
  date: string;
  soup: boolean;
}

router.post('/hours', currentUser, requireAuth, async (req, res) => {
  const { mealCount, shiftId, jobId, date, soup }: HoursPostParams = req.body;
  const salesforceId = req.currentUser!.salesforceId;
  if (!salesforceId) {
    throw Error('User does not have a salesforce ID');
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

router.patch('/hours/:id', currentUser, requireAuth, async (req, res) => {
  const { id } = req.params;
  const {
    mealCount,
    cancel,
    soup,
    emailData,
  }: {
    mealCount: number;
    cancel: boolean;
    soup: boolean;
    emailData: { fridge: string; date: string };
  } = req.body;

  await editHours(mealCount, soup, cancel, id);
  // opp is updated by a salesforce flow

  // email user confirmation
  // get user email, date of shift, and fridge name
  const { Email } = await getContactById(req.currentUser!.salesforceId);
  // email user confirmation
  await sendShiftEditEmail(Email, {
    date: emailData.date,
    fridge: emailData.fridge,
    cancel,
    mealCount,
  });

  res.send({ id, mealCount });
});

export default router;
