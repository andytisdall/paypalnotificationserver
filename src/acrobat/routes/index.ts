import express from 'express';

import fetcher from '../../utils/fetcher';

const router = express.Router();

router.post('/', async (req, res) => {
  await fetcher.setService('acrobat');
  res.sendStatus(204);
});

export default router;
