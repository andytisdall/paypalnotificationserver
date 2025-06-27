import express from "express";
import moment from "moment";

import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import urls from "../../utils/urls";
import fetcher from "../../utils/fetcher";
import { getJobs } from "../../utils/salesforce/SFQuery/volunteer/jobs";
import { getShifts } from "../../utils/salesforce/SFQuery/volunteer/shifts";

const router = express.Router();

const BARLTETT_ID = "a0w8Z00000YU0nHQAT";

router.get("/fridges", currentUser, requireAuth, async (req, res) => {
  // this router gets the fridges for text app purposes
  // fridges without a region are excluded
  await fetcher.setService("salesforce");

  const jobs = await getJobs(urls.townFridgeCampaignId);
  res.send(jobs.filter((j) => j.active && j.id !== BARLTETT_ID));
});

router.get("/job-listing", currentUser, requireAuth, async (req, res) => {
  await fetcher.setService("salesforce");

  const jobs = await getJobs(urls.townFridgeCampaignId);
  const shiftPromises = jobs.map(async (j) => {
    const jobShifts = await getShifts(j.id);
    const jobShiftsExcludingRestaurantMeals = jobShifts
      .filter((js) => !js.restaurantMeals)
      .map((js) => {
        return {
          ...js,
          startTime: moment(js.startTime, "YYYY-MM-DDTHH:mm:ssZ").format(
            "YYYY-MM-DD"
          ),
        };
      });
    j.shifts = jobShiftsExcludingRestaurantMeals;
    return jobShiftsExcludingRestaurantMeals;
  });
  const shifts = (await Promise.all(shiftPromises)).flat();
  const mappedJobs = jobs.map((j) => {
    return { ...j, shifts: j.shifts.map((sh) => sh.id) };
  });
  // filter out jobs with no visible shifts
  res.send({ jobs: mappedJobs.filter((j) => j.shifts.length > 0), shifts });
});

export default router;
