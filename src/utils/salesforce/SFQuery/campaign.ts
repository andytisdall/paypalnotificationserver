import fetcher from '../../fetcher';
import urls from '../../urls';

export const getCampaign = async () => {
  await fetcher.setService('salesforce');
  const {
    data,
  }: { data: { Name: string; StartDate: string; Description: string } } =
    await fetcher.get(
      urls.SFOperationPrefix + '/Campaign/' + urls.eventCampaignId
    );
  return {
    name: data.Name,
    date: data.StartDate,
    description: data.Description,
  };
};
