import express from 'express';

import { getHomeChefCampaign } from '../../utils/salesforce/SFQuery/campaign';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';

const REGION_NAMES = {
  WEST_OAKLAND: 'WEST_OAKLAND',
  EAST_OAKLAND: 'EAST_OAKLAND',
};

const townFridges = [
  {
    name: 'Homies',
    address: '7631 MacArthur Blvd',
    region: REGION_NAMES.EAST_OAKLAND,
  },
  {
    name: 'Omni Commons',
    address: '4799 Shattuck Ave',
    region: REGION_NAMES.WEST_OAKLAND,
  },
  {
    name: 'City Slicker Farms',
    address: '2847 Peralta St',
    region: REGION_NAMES.WEST_OAKLAND,
  },
  {
    name: '44th St. & Telegraph',
    region: REGION_NAMES.WEST_OAKLAND,
  },
  {
    name: 'Hasta Muerte',
    address: 'East 27th St & Fruitvale Ave',
    region: REGION_NAMES.EAST_OAKLAND,
  },
  {
    name: '10th St. & Mandela',
    region: REGION_NAMES.WEST_OAKLAND,
  },
  { name: '59th St. & Vallejo', region: REGION_NAMES.WEST_OAKLAND },
  { name: 'Cole St. & Foothill Blvd', region: REGION_NAMES.EAST_OAKLAND },
];

const router = express.Router();

// campaign route is public so ckoakland volunteer page
// can display current number of meals donated

router.get('/campaign', async (req, res) => {
  const { Total_Meals_Donated__c } = await getHomeChefCampaign();

  res.send({
    mealsDonated: Total_Meals_Donated__c,
  });
});

router.get('/campaign/fridges', currentUser, requireAuth, async (req, res) => {
  res.send(townFridges);
});

export default router;
