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
}

export interface FormattedVolunteerCampaign {
  name: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  id: string;
}

export interface FormattedEventCampaign {
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

export interface UnformattedEventCampaign {
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
