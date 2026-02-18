import fetcher from "../../../../fetcher";
import urls from "../../../../urls";
import createQuery, { FilterGroup } from "../../queryCreator";
import { UnformattedHours } from "../types";
import {
  FormattedVolunteerCampaign,
  UnformattedVolunteerCampaign,
  FormattedEventCampaign,
  UnformattedEventCampaign,
} from "./types";

export const getVolunteerCampaigns: () => Promise<
  FormattedVolunteerCampaign[]
> = async () => {
  const fields = [
    "Name",
    "Id",
    "Description",
    "StartDate",
    "EndDate",
    "Short_Description__c",
  ] as const;
  const obj = "Campaign";
  const filters: FilterGroup<UnformattedVolunteerCampaign> = {
    AND: [
      { field: "Portal_Signups_Enabled__c", value: true },
      {
        OR: [
          {
            field: "StartDate",
            operator: ">",
            value: { date: new Date(), type: "date" },
          },
          { field: "StartDate", value: null },
        ],
      },
    ],
  };

  const campaigns = await createQuery<
    UnformattedVolunteerCampaign,
    (typeof fields)[number]
  >({
    fields,
    obj,
    filters,
  });

  return campaigns.map((cam) => {
    return {
      name: cam.Name,
      startDate: cam.StartDate,
      description: cam.Description,
      shortDescription: cam.Short_Description__c,
      id: cam.Id,
    };
  });
};

export const getD4JCampaigns: () => Promise<
  FormattedEventCampaign[]
> = async () => {
  await fetcher.setService("salesforce");
  const query = `SELECT Name, Id, Description, stayclassy__Start_Date__c, stayclassy__End_Date__c, stayclassy__venue_name__c, stayclassy__address1__c, stayclassy__city__c, Event_URL__c, stayclassy__Event_Image_URL__c FROM Campaign WHERE ParentId = '${urls.d4jCampaignId}' AND RecordTypeId = '0128Z000001BIZDQA4' AND stayclassy__Start_Date__c != NULL ORDER BY stayclassy__Start_Date__c`;
  const queryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const { data }: { data: { records?: UnformattedEventCampaign[] } } =
    await fetcher.get(queryUri);

  if (!data.records) {
    throw Error("Could not query");
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
    await fetcher.get(urls.SFOperationPrefix + "/Campaign/" + id);
  return {
    name: data.Name,
    date: data.StartDate,
    description: data.Description,
    id,
  };
};

export const getHomeChefCampaign = async () => {
  await fetcher.setService("salesforce");
  const { data }: { data: { Total_Meals_Donated__c: number } | undefined } =
    await fetcher.get(
      urls.SFOperationPrefix + "/Campaign/" + urls.townFridgeCampaignId,
    );
  if (!data?.Total_Meals_Donated__c && data?.Total_Meals_Donated__c !== 0) {
    throw Error("Could not get campaign info");
  }
  return data;
};

export const getCampaignFromHours = async (id: string) => {
  await fetcher.setService("salesforce");

  const getUri = `${urls.SFOperationPrefix}/GW_Volunteers__Volunteer_Hours__c/${id}`;

  const { data }: { data: UnformattedHours } = await fetcher.get(getUri);
  if (data.GW_Volunteers__Volunteer_Campaign__c) {
    return {
      id: data.GW_Volunteers__Volunteer_Campaign__c,
      name: data.GW_Volunteers__Volunteer_Campaign_Name__c,
      startDate: data.GW_Volunteers__Start_Date_Time__c,
    };
  }
};

export const getMealProgramData = async () => {
  await fetcher.setService("salesforce");

  const query =
    "SELECT SUM(Total_Meals__c) total from Meal_Program_Delivery__c WHERE Date__c <= TODAY";

  const { data }: { data: { records?: { total: number }[] } } =
    await fetcher.get(urls.SFQueryPrefix + encodeURIComponent(query));

  if (!data.records) {
    throw Error("Meal program data could not be fetched");
  }

  return data.records[0].total;
};
