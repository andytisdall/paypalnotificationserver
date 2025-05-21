import express from "express";
import { getDay, addDays } from "date-fns";
import utcToZonedTime from "date-fns-tz/utcToZonedTime";

import urls from "../../utils/urls";
import {
  getVolunteerCampaigns,
  getCampaign,
} from "../../utils/salesforce/SFQuery/volunteer/campaign/campaign";
import { getJobs } from "../../utils/salesforce/SFQuery/volunteer/jobs";
import { getShifts } from "../../utils/salesforce/SFQuery/volunteer/shifts";

const router = express.Router();

router.get("/campaigns", async (req, res) => {
  const campaigns = await getVolunteerCampaigns();

  res.send(campaigns);
});

export default router;
