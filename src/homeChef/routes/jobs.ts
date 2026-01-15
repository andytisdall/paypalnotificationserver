import express from "express";
import moment from "moment";

import { getJobs } from "../../utils/salesforce/SFQuery/volunteer/jobs";
import urls from "../../utils/urls";
import { getShifts } from "../../utils/salesforce/SFQuery/volunteer/shifts";
import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import fetcher from "../../utils/fetcher";

const router = express.Router();

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
