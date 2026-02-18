import { decode } from "html-entities";

import { FilterGroup } from "../queryCreator";
import createQuery from "../queryCreator";
import fetcher from "../../../fetcher";
import urls from "../../../urls";
import { Job, FormattedJob } from "./types";

const decodeString = (string: string) => {
  return decode(
    string?.replace(/\<\/p\>\<p\>/g, "\n").replace(/\<[^<>]*\>/g, ""),
  );
};

export const getJobs = async (campaignId: string): Promise<FormattedJob[]> => {
  const fields = [
    "Id",
    "Name",
    "Car_Size_Required__c",
    "Dropoff_Notes__c",
    "Dropoff_Location__c",
    "GW_Volunteers__Inactive__c",
    "GW_Volunteers__Location_Street__c",
    "GW_Volunteers__Description__c",
    "GW_Volunteers__Ongoing__c",
    "Region__c",
    "Fridge_Notes__c",
    "GW_Volunteers__Location_Information__c",
    "GW_Volunteers__Location_City__c",
    "Distance__c",
    "Time_Required__c",
  ] as const;

  const obj = "GW_Volunteers__Volunteer_Job__c";

  const filters: FilterGroup<Job> = {
    AND: [
      { field: "GW_Volunteers__Campaign__c", value: campaignId },
      { field: "GW_Volunteers__Display_on_Website__c", value: true },
    ],
  };

  const jobs = await createQuery<Job, (typeof fields)[number]>({
    fields,
    filters,
    obj,
  });

  const promises = jobs.map(async (j) => {
    return {
      id: j.Id,
      name: j.Name,
      shifts: [],
      active: !j.GW_Volunteers__Inactive__c,
      ongoing: j.GW_Volunteers__Ongoing__c,
      location: j.GW_Volunteers__Location_Street__c,
      locationCity: j.GW_Volunteers__Location_City__c,
      locationInfo: decodeString(j.GW_Volunteers__Location_Information__c),
      description: decodeString(j.GW_Volunteers__Description__c),
      campaign: campaignId,
      region: j.Region__c,
      notes: j.Fridge_Notes__c,
      carSizeRequired: j.Car_Size_Required__c,
      destination: j.Dropoff_Location__c,
      dropoffNotes: j.Dropoff_Notes__c,
      timeRequired: j.Time_Required__c,
      distance: j.Distance__c,
    };
  });

  return await Promise.all(promises);
};

export const getJobFromHours = async (jobId: string) => {
  await fetcher.setService("salesforce");

  const { data: job }: { data: Job } = await fetcher.get(
    urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Job__c/" + jobId,
  );

  return job;
};
