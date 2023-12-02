import express from 'express';

import { createD4jVisit } from '../utils/salesforce/SFQuery/d4j';
import { getD4JVisits } from '../utils/salesforce/SFQuery/d4j';
import { currentD4JUser } from '../middlewares/current-d4j-user';

const router = express.Router();

router.post('/receipt', currentD4JUser, async (req, res) => {
  const { restaurantId, date }: { restaurantId: string; date: string } =
    req.body;

  if (!req.files?.receipt || Array.isArray(req.files.receipt)) {
    throw Error('Receipt not found or in the wrong format');
  }

  if (!req.currentD4JUser) {
    throw Error('User is not signed in');
  }

  await createD4jVisit({
    receipt: req.files.receipt,
    contactId: req.currentD4JUser.id,
    restaurantId,
    date,
  });

  res.status(201).send({ restaurantId, date });
});

router.get('/visits', currentD4JUser, async (req, res) => {
  if (!req.currentD4JUser) {
    return res.sendStatus(204);
  }
  const visits = await getD4JVisits(req.currentD4JUser.id);
  res.send(visits);
});

export default router;
