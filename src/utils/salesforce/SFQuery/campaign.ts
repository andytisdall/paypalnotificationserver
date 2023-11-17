import fetcher from '../../fetcher';
import urls from '../../urls';
import { InsertSuccessResponse } from './reusableTypes';

export interface CampaignMemberObject {
  CampaignId: string;
  ContactId: string;
  Status: string;
}

export interface UnformattedVolunteerCampaign {
  Name: string;
  StartDate?: string;
  EndDate?: string;
  Description?: string;
  Id: string;
  Portal_Button_Text__c?: string;
}

export interface FormattedVolunteerCampaign {
  name: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  id: string;
  buttonText?: string;
}

export const getVolunteerCampaigns: () => Promise<
  FormattedVolunteerCampaign[]
> = async () => {
  await fetcher.setService('salesforce');
  const query = `SELECT Name, Id, Description, StartDate, EndDate, Portal_Button_Text__c FROM Campaign WHERE RecordTypeId = '0128Z000000yJ4PQAU' AND Status = 'Planned'`;
  const queryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const { data }: { data: { records?: UnformattedVolunteerCampaign[] } } =
    await fetcher.get(queryUri);

  if (!data.records) {
    throw Error('Could not query');
  }

  return data.records.map((cam) => {
    return {
      name: cam.Name,
      startDate: cam.StartDate,
      endDate: cam.EndDate,
      description: cam.Description,
      id: cam.Id,
      buttonText: cam.Portal_Button_Text__c,
    };
  });
};

export const getCampaign = async (id: string) => {
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

export const getCampaignFromHours = async (id: string) => {
  await fetcher.setService('salesforce');

  const getUri = `${urls.SFOperationPrefix}/GW_Volunteers__Volunteer_Hours__c/${id}`;

  const { data } = await fetcher.get(getUri);
  if (data.GW_Volunteers__Volunteer_Campaign__c) {
    return {
      id: data.GW_Volunteers__Volunteer_Campaign__c,
      name: data.GW_Volunteers__Volunteer_Campaign_Name__c,
    };
  }
};
