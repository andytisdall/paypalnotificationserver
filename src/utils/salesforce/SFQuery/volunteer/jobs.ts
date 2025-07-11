import { decode } from "html-entities";

import fetcher from "../../../fetcher";
import urls from "../../../urls";
import { Job, FormattedJob } from "./types";

const decodeString = (string: string) => {
  return decode(
    string?.replace(/\<\/p\>\<p\>/g, "\n").replace(/\<[^<>]*\>/g, "")
  );
};

export const getJobs = async (campaignId: string): Promise<FormattedJob[]> => {
  const query = `SELECT Id, Name, GW_Volunteers__Inactive__c, GW_Volunteers__Location_Street__c, GW_Volunteers__Description__c, GW_Volunteers__Ongoing__c, Region__c, Fridge_Notes__c, GW_Volunteers__Location_Information__c, GW_Volunteers__Location_City__c from GW_Volunteers__Volunteer_Job__c WHERE GW_Volunteers__Campaign__c = '${campaignId}' AND GW_Volunteers__Display_on_Website__c = TRUE`;

  const jobQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const res: {
    data: {
      records:
        | Pick<
            Job,
            | "Id"
            | "Name"
            | "GW_Volunteers__Inactive__c"
            | "GW_Volunteers__Location_Street__c"
            | "GW_Volunteers__Description__c"
            | "GW_Volunteers__Ongoing__c"
            | "Region__c"
            | "Fridge_Notes__c"
            | "GW_Volunteers__Location_Information__c"
            | "GW_Volunteers__Location_City__c"
          >[]
        | undefined;
    };
  } = await fetcher.get(jobQueryUri);
  if (!res.data.records) {
    throw Error("failed querying volunteer Jobs");
  }

  const promises = res.data.records.map(async (j: Job) => {
    // rename attributes to something sane
    return {
      id: j.Id,
      name: j.Name,
      shifts: [],
      active: !j.GW_Volunteers__Inactive__c,
      ongoing: j.GW_Volunteers__Ongoing__c,
      location:
        j.GW_Volunteers__Location_Street__c +
        " " +
        j.GW_Volunteers__Location_City__c,
      locationInfo: decodeString(j.GW_Volunteers__Location_Information__c),
      description: decodeString(j.GW_Volunteers__Description__c),
      campaign: campaignId,
      region: j.Region__c,
      notes: j.Fridge_Notes__c,
    };
  });

  return await Promise.all(promises);
};

export const getJobFromHours = async (jobId: string) => {
  await fetcher.setService("salesforce");

  const { data: job }: { data: Job } = await fetcher.get(
    urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Job__c/" + jobId
  );

  return job;
};
