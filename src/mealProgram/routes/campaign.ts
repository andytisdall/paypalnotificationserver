import express from 'express';

import urls from '../../utils/urls';
import fetcher from '../../utils/fetcher';

const router = express.Router();

const PAST_YEARS_MEAL_TOTAL = 193131;

router.get('/campaign', async (req, res) => {
  await fetcher.setService('salesforce');

  const query =
    'SELECT SUM(Total_Meals__c) total from Meal_Program_Delivery__c WHERE Date__c <= TODAY';

  const { data }: { data: { records?: { total: number }[] } } =
    await fetcher.get(urls.SFQueryPrefix + encodeURIComponent(query));

  if (!data.records) {
    throw Error('Meal progrqam data could not be fetched');
  }

  res.send({ total: data.records[0].total + PAST_YEARS_MEAL_TOTAL });
});

export default router;
