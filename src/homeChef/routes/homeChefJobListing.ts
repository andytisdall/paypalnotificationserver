import express from 'express';
import moment from 'moment';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import urls from '../../utils/urls';
import fetcher from '../../utils/fetcher';
import { getJobs, getShifts } from '../../utils/salesforce/SFQuery';

const router = express.Router();

router.get('/job-listing', currentUser, requireAuth, async (req, res) => {
  await fetcher.setService('salesforce');

  const jobs = await getJobs(urls.townFridgeCampaignId);
  const shiftPromises = jobs.map(async (j) => {
    const jobShifts = await getShifts(j.id);
    const jobShiftsExcludingRestaurantMeals = jobShifts
      .filter((js) => !js.restaurantMeals)
      .map((js) => {
        return {
          ...js,
          startTime: moment(js.startTime, 'YYYY-MM-DDTHH:mm:ssZ').format(
            'YYYY-MM-DD'
          ),
        };
      });
    j.shifts = jobShiftsExcludingRestaurantMeals.map((js) => js.id);
    return jobShiftsExcludingRestaurantMeals;
  });
  const shifts = (await Promise.all(shiftPromises)).flat();
  res.send({ jobs, shifts });
});

export default router;
