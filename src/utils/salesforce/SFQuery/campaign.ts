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

interface FormattedEventCampaign {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  venue?: string;
  description?: string;
  address?: string;
  city?: string;
  url?: string;
  photo?: string;
}

interface UnformattedEventCampaign {
  Id: string;
  Name: string;
  stayclassy__Start_Date__c: string;
  stayclassy__End_Date__c?: string;
  stayclassy__venue_name__c?: string;
  Description?: string;
  stayclassy__address1__c?: string;
  stayclassy__city__c?: string;
  Event_URL__c?: string;
  stayclassy__Event_Image_URL__c?: string;
}

export const getVolunteerCampaigns: () => Promise<
  FormattedVolunteerCampaign[]
> = async () => {
  await fetcher.setService('salesforce');
  const query =
    'SELECT Name, Id, Description, StartDate, EndDate, Portal_Button_Text__c FROM Campaign WHERE Portal_Signups_Enabled__c = True';
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
      description: cam.Description,
      id: cam.Id,
      buttonText: cam.Portal_Button_Text__c,
    };
  });
};

export const getD4JCampaigns: () => Promise<
  FormattedEventCampaign[]
> = async () => {
  await fetcher.setService('salesforce');
  const query = `SELECT Name, Id, Description, stayclassy__Start_Date__c, stayclassy__End_Date__c, stayclassy__venue_name__c, stayclassy__address1__c, stayclassy__city__c, Event_URL__c, stayclassy__Event_Image_URL__c FROM Campaign WHERE ParentId = '${urls.d4jCampaignId}' AND RecordTypeId = '0128Z000001BIZDQA4' AND stayclassy__Start_Date__c != NULL ORDER BY stayclassy__Start_Date__c`;
  const queryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const { data }: { data: { records?: UnformattedEventCampaign[] } } =
    await fetcher.get(queryUri);

  if (!data.records) {
    throw Error('Could not query');
  }

  return data.records.map((cam) => {
    return {
      id: cam.Id,
      name: cam.Name,
      startDate: cam.stayclassy__Start_Date__c,
      endDate: cam.stayclassy__End_Date__c,
      venue: cam.stayclassy__venue_name__c,
      description: cam.Description,
      address: cam.stayclassy__address1__c,
      city: cam.stayclassy__city__c,
      url: cam.Event_URL__c,
      photo: cam.stayclassy__Event_Image_URL__c,
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

export const getMealProgramData = async () => {
  await fetcher.setService('salesforce');

  const query =
    'SELECT SUM(Total_Meals__c) total from Meal_Program_Delivery__c WHERE Date__c <= TODAY';

  const { data }: { data: { records?: { total: number }[] } } =
    await fetcher.get(urls.SFQueryPrefix + encodeURIComponent(query));

  if (!data.records) {
    throw Error('Meal program data could not be fetched');
  }

  return data.records[0].total;
};
