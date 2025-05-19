import { decode } from "html-entities";

import fetcher from "../../../fetcher";
import urls from "../../../urls";
import { Job, FormattedJob } from "./types";
import { getDirections } from "../../googleApis/getDirections";

export const getJobs = async (campaignId: string): Promise<FormattedJob[]> => {
  const query = `SELECT Id, Name, GW_Volunteers__Inactive__c, GW_Volunteers__Location_Street__c, GW_Volunteers__Description__c, GW_Volunteers__Ongoing__c, Region__c,Fridge_Notes__c, Destination__c from GW_Volunteers__Volunteer_Job__c WHERE GW_Volunteers__Campaign__c = '${campaignId}' AND GW_Volunteers__Display_on_Website__c = TRUE`;

  const jobQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const res: { data: { records: Job[] | undefined } } = await fetcher.get(
    jobQueryUri
  );
  if (!res.data.records) {
    throw Error("failed querying volunteer Jobs");
  }

  const promises = res.data.records.map(async (j: Job) => {
    let distance;
    if (j.Destination__c) {
      distance = await getDirections(
        j.GW_Volunteers__Location_Street__c,
        j.Destination__c
      );
    }

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
      distance,
    };
  });

  return await Promise.all(promises);
};
