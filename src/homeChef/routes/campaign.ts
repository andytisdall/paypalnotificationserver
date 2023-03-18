import express from 'express';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import urls from '../../utils/urls';
import fetcher from '../../utils/fetcher';

const router = express.Router();

router.get('/campaign', currentUser, requireAuth, async (req, res) => {
  await fetcher.setService('salesforce');
  const { data }: { data: { Total_Meals_Donated__c: number } | undefined } =
    await fetcher.get(
      urls.SFOperationPrefix + '/Campaign/' + urls.townFridgeCampaignId
    );
  if (!data?.Total_Meals_Donated__c) {
    throw Error('Could not get campaign info');
  }
  res.send({
    mealsDonated: data.Total_Meals_Donated__c,
  });
});

export default router;
