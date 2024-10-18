import express from 'express';

import { createHours } from '../../utils/salesforce/SFQuery/hours';

const router = express.Router();

router.post('/hours', async (req, res) => {
  const {
    shiftId,
    jobId,
    date,
    contactSalesforceId,
  }: {
    shiftId: string;
    jobId: string;
    date: string;
    contactSalesforceId: string;
  } = req.body;

  const hours = await createHours({
    contactId: contactSalesforceId,
    shiftId,
    jobId,
    date,
  });

  res.status(201);
  res.send(hours);
});

export default router;
