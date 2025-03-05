import { decode } from "html-entities";

import fetcher from "../../../fetcher";
import urls from "../../../urls";

export interface Job {
  Id: string;
  Name: string;
  GW_Volunteers__Inactive__c: boolean;
  GW_Volunteers__Ongoing__c: boolean;
  GW_Volunteers__Description__c: string;
  GW_Volunteers__Location_Street__c: string;
  Region__c?: "East Oakland" | "West Oakland";
  Fridge_Notes__c?: string;
}

export interface FormattedJob {
  id: string;
  name: string;
  location: string;
  shifts: string[];
  active: boolean;
  ongoing: boolean;
  description: string;
  campaign: string;
  region?: "East Oakland" | "West Oakland";
  notes?: string;
}

export const getJobs = async (campaignId: string): Promise<FormattedJob[]> => {
  const query = `SELECT Id, Name, GW_Volunteers__Inactive__c, GW_Volunteers__Location_Street__c, GW_Volunteers__Description__c, GW_Volunteers__Ongoing__c, Region__c,Fridge_Notes__c from GW_Volunteers__Volunteer_Job__c WHERE GW_Volunteers__Campaign__c = '${campaignId}' AND GW_Volunteers__Display_on_Website__c = TRUE`;

  const jobQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const res: { data: { records: Job[] | undefined } } = await fetcher.get(
    jobQueryUri
  );
  if (!res.data.records) {
    throw Error("failed querying volunteer Jobs");
  }

  return res.data.records.map((j: Job) => {
    // rename attributes to something sane
    return {
      id: j.Id,
      name: j.Name,
      shifts: [],
      active: !j.GW_Volunteers__Inactive__c,
      ongoing: j.GW_Volunteers__Ongoing__c,
      location: j.GW_Volunteers__Location_Street__c,
      description: decode(
        j.GW_Volunteers__Description__c?.replace(/\<\/p\>\<p\>/g, "\n").replace(
          /\<[^<>]*\>/g,
          ""
        )
      ),
      campaign: campaignId,
      region: j.Region__c,
      notes: j.Fridge_Notes__c,
    };
  });
};
