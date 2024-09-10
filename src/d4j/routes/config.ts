import express from 'express';

const router = express.Router();

const LATEST_D4J_APP_VERSION = '2.0';

router.get('/version', (req, res) => {
  res.send({ currentVersion: LATEST_D4J_APP_VERSION });
});

router.get('/style-week', (req, res) => {
  res.send(false);
});

export default router;
