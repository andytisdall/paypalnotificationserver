import express from 'express';

import { createD4jVisit } from '../utils/salesforce/SFQuery/d4j';

const router = express.Router();

router.post('/receipt', async (req, res) => {
  const {
    contactId,
    restaurantId,
    date,
  }: { contactId: string; restaurantId: string; date: string } = req.body;

  if (!req.files?.receipt || Array.isArray(req.files.receipt)) {
    throw Error('Receipt not found or in the wrong format');
  }

  await createD4jVisit({
    receipt: req.files.receipt,
    contactId,
    restaurantId,
    date,
  });
  res.sendStatus(204);
});

export default router;
