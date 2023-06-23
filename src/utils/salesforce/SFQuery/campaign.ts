import fetcher from '../../fetcher';
import urls from '../../urls';

export const getCampaign = async (id: string) => {
  await fetcher.setService('salesforce');
  const {
    data,
  }: { data: { Name: string; StartDate: string; Description: string } } =
    await fetcher.get(urls.SFOperationPrefix + '/Campaign/' + id);
  return {
    name: data.Name,
    date: data.StartDate,
    description: data.Description,
    id,
  };
};

export const getHomeChefCampaign = async () => {
  await fetcher.setService('salesforce');
  const { data }: { data: { Total_Meals_Donated__c: number } | undefined } =
    await fetcher.get(
      urls.SFOperationPrefix + '/Campaign/' + urls.townFridgeCampaignId
    );
  if (!data?.Total_Meals_Donated__c && data?.Total_Meals_Donated__c !== 0) {
    throw Error('Could not get campaign info');
  }
  return data;
};
