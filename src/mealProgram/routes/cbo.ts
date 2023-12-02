import express from 'express';

import { getCBOReports } from '../../utils/salesforce/SFQuery/cboReport';

const router = express.Router();

router.get('/cbo/reports', async (req, res) => {
  const reports = await getCBOReports();
  res.send(reports);
});

export default router;
