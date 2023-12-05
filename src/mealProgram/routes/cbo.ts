import express from 'express';

import { getCBOReports } from '../../utils/salesforce/SFQuery/cboReport';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';

const router = express.Router();

router.get(
  '/cbo/reports',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const reports = await getCBOReports();
    res.send(reports);
  }
);

export default router;
