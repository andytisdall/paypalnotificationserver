import fetcher from '../../../../fetcher';
import urls from '../../../../urls';
import { InsertSuccessResponse } from '../../reusableTypes';
import { getContactByEmail } from '../../contact';
import { CampaignMemberObject } from './types';

export const insertCampaignMember = async (
  campaignMember: CampaignMemberObject
) => {
  await fetcher.setService('salesforce');
  const query = `SELECT Id FROM CampaignMember WHERE ContactId = '${campaignMember.ContactId}' AND CampaignId = '${campaignMember.CampaignId}'`;
  const getUrl = urls.SFQueryPrefix + encodeURIComponent(query);
  const existingCampaignMember: {
    data: { records: { Id: string }[] } | undefined;
  } = await fetcher.get(getUrl);
  if (existingCampaignMember.data?.records[0]) {
    return;
  }
  const url = urls.SFOperationPrefix + '/CampaignMember';
  const res: { data: InsertSuccessResponse | undefined } = await fetcher.post(
    url,
    campaignMember
  );
  if (!res.data?.success) {
    throw Error('Could not insert campaign member object');
  }
};

export const updateCampaignMember = async ({
  email,
  campaignId,
  response,
}: {
  email: string;
  campaignId: string;
  response: { attending: boolean; guest: boolean };
}) => {
  await fetcher.setService('salesforce');

  const contact = await getContactByEmail(email);

  if (!contact) {
    throw Error('Could not find a contact with that email');
  }

  const query = `SELECT Id FROM CampaignMember WHERE ContactId = '${contact.id}' AND CampaignId = '${campaignId}'`;
  const getUrl = urls.SFQueryPrefix + encodeURIComponent(query);
  const { data } = await fetcher.get(getUrl);

  const campaignMember = data.records[0];

  if (!campaignMember) {
    throw Error('Contact is not on guest list');
  }

  const status = response.attending
    ? response.guest
      ? 'Attending with Guest'
      : 'Attending'
    : 'Not Attending';

  const url = urls.SFOperationPrefix + '/CampaignMember/' + campaignMember.Id;
  const res: { data: InsertSuccessResponse | undefined } = await fetcher.patch(
    url,
    { Status: status }
  );

  if (!res.data?.success) {
    throw Error('Could not update guest status. Please try again.');
  }
};
