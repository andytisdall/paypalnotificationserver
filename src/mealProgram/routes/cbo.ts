import express from "express";
import { lastDayOfMonth } from "date-fns";

import { CBOReportParams } from "../../utils/salesforce/cbo/types";
import { getCBOReports } from "../../utils/salesforce/cbo/getReports";
import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { requireAdmin } from "../../middlewares/require-admin";
import { sendCBOReportDataEmail } from "../../utils/email/emailTemplates/CBOReportData";

import { requireSalesforceAuth } from "../../middlewares/require-salesforce-auth";
import { createCBOReport } from "../../utils/salesforce/cbo/createReport";

const router = express.Router();

router.get(
  "/cbo/reports/:dateRange",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const [start, end] = req.params.dateRange.split("&");

    const reports = await getCBOReports({
      startDate: new Date(start),
      endDate: new Date(end),
    });

    res.send(reports);
  },
);

router.post(
  "/cbo/email/mollye",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    await sendCBOReportDataEmail(["mollye@ckoakland.org"]);
    res.send(null);
  },
);

router.post("/cbo/email", requireSalesforceAuth, async (req, res) => {
  await sendCBOReportDataEmail();
  res.send({ success: true });
});

router.post("/cbo", async (req, res) => {
  const submission: CBOReportParams = req.body;

  await createCBOReport(submission);

  res.sendStatus(204);
});

export default router;
