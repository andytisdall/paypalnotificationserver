import express from 'express';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import urls from '../../utils/urls';
import fetcher from '../../utils/fetcher';

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
];

const router = express.Router();

router.get('/campaign', currentUser, requireAuth, async (req, res) => {
  await fetcher.setService('salesforce');
  const { data }: { data: { Total_Meals_Donated__c: number } | undefined } =
    await fetcher.get(
      urls.SFOperationPrefix + '/Campaign/' + urls.townFridgeCampaignId
    );
  if (!data?.Total_Meals_Donated__c && data?.Total_Meals_Donated__c !== 0) {
    throw Error('Could not get campaign info');
  }
  res.send({
    mealsDonated: data.Total_Meals_Donated__c,
  });
});

router.get('/campaign/fridges', currentUser, requireAuth, async (req, res) => {
  res.send(townFridges);
});

router.get('/campaign/event', currentUser, requireAuth, async (req, res) => {
  await fetcher.setService('salesforce');
  const {
    data,
  }: { data: { Name: string; StartDate: string; Description: string } } =
    await fetcher.get(
      urls.SFOperationPrefix + '/Campaign/' + urls.eventCampaignId
    );
  res.send({
    name: data.Name,
    date: data.StartDate,
    description: data.Description,
  });
});

export default router;
