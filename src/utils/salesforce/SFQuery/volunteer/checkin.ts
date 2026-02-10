import fetcher from "../../../fetcher";
import urls from "../../../urls";
import { UnformattedContact } from "../contact/types";
import createQuery, { FilterGroup } from "../queryCreator";
import { UnformattedHours, Job, Shift, CheckInVolunteer } from "./types";
import { UnformattedVolunteerCampaign } from "./campaign/types";

export const getTodaysVolunteerShifts = async () => {
  const campaignFields = ["Id"] as const;
  const campaignObj = "Campaign";
  const campaignFilters: FilterGroup<UnformattedVolunteerCampaign> = {
    AND: [
      { field: "Portal_Signups_Enabled__c", value: true },
      { field: "Name", operator: "!=", value: "Delivery Drivers" },
    ],
  };
  const campaigns = await createQuery<
    UnformattedVolunteerCampaign,
    (typeof campaignFields)[number]
  >({ fields: campaignFields, obj: campaignObj, filters: campaignFilters });

  const idList = [...campaigns.map(({ Id }) => Id)];

  const jobFields = ["Id", "Name"] as const;
  const jobObj = "GW_Volunteers__Volunteer_Job__c";
  const jobFilters: FilterGroup<Job> = {
    AND: [
      {
        field: "GW_Volunteers__Campaign__c",
        operator: "IN",
        value: idList,
      },
    ],
  };

  const jobs = await createQuery<Job, (typeof jobFields)[number]>({
    fields: jobFields,
    filters: jobFilters,
    obj: jobObj,
  });

  const jobShifts: {
    jobs: Record<string, { id: string; name: string; shifts: string[] }>;
    shifts: Record<
      string,
      { id: string; jobName: string; startTime: string; duration: number }
    >;
  } = { jobs: {}, shifts: {} };

  const shiftPromises = jobs.map(async (job) => {
    const fields = [
      "Id",
      "GW_Volunteers__Start_Date_Time__c",
      "GW_Volunteers__Duration__c",
    ] as const;
    const obj = "GW_Volunteers__Volunteer_Shift__c";
    const filters: FilterGroup<Shift> = {
      AND: [
        { field: "GW_Volunteers__Volunteer_Job__c", value: job.Id },
        {
          field: "GW_Volunteers__Start_Date_Time__c",
          value: { date: "TODAY", type: "datestring" },
        },
      ],
    };

    const shifts = await createQuery<Shift, (typeof fields)[number]>({
      fields,
      obj,
      filters,
    });

    if (shifts.length) {
      shifts?.forEach((shift) => {
        jobShifts.shifts[shift.Id] = {
          id: shift.Id,
          jobName: job.Name,
          startTime: shift.GW_Volunteers__Start_Date_Time__c,
          duration: shift.GW_Volunteers__Duration__c,
        };
      });

      jobShifts.jobs[job.Id] = {
        id: job.Id,
        name: job.Name,
        shifts: shifts.map(({ Id }) => Id),
      };
    }
  });

  await Promise.all(shiftPromises);

  return jobShifts;
};

export const getVolunteersForCheckIn = async (
  shiftId: string,
): Promise<CheckInVolunteer[]> => {
  await fetcher.setService("salesforce");

  const fields = [
    "Id",
    "GW_Volunteers__Contact__c",
    "GW_Volunteers__Status__c",
  ] as const;
  const obj = "GW_Volunteers__Volunteer_Hours__c";
  const filters: FilterGroup<UnformattedHours> = {
    AND: [
      { field: "GW_Volunteers__Status__c", operator: "!=", value: "Canceled" },
      { field: "GW_Volunteers__Volunteer_Shift__c", value: shiftId },
    ],
  };

  const hours = await createQuery<UnformattedHours, (typeof fields)[number]>({
    fields,
    obj,
    filters,
  });

  const idList: string[] = hours.map(
    ({ GW_Volunteers__Contact__c }) => GW_Volunteers__Contact__c,
  );

  const contactFields = [
    "Id",
    "FirstName",
    "LastName",
    "Email",
    "CK_Kitchen_Agreement__c",
  ] as const;
  const contactObj = "Contact";
  const contactFilters: FilterGroup<UnformattedContact> = {
    AND: [{ field: "Id", operator: "IN", value: idList }],
  };

  const contacts = await createQuery<
    UnformattedContact,
    (typeof contactFields)[number]
  >({
    fields: contactFields,
    obj: contactObj,
    filters: contactFilters,
  });

  return hours
    .map(({ GW_Volunteers__Contact__c, GW_Volunteers__Status__c, Id }) => {
      const contact = contacts.find(
        ({ Id }) => Id === GW_Volunteers__Contact__c,
      );
      if (contact) {
        return {
          hoursId: Id,
          contactId: contact.Id,
          firstName: contact.FirstName,
          lastName: contact.LastName,
          email: contact.Email,
          volunteerAgreement: contact.CK_Kitchen_Agreement__c,
          status: GW_Volunteers__Status__c,
        };
      }
    })
    .filter((h) => h) as CheckInVolunteer[];
};

export const checkInVolunteer = async ({
  hoursId,
  duration,
}: {
  hoursId: string;
  duration: number;
}) => {
  await fetcher.setService("salesforce");

  const updateUri =
    urls.SFOperationPrefix + "/GW_Volunteers__Volunteer_Hours__c/" + hoursId;

  const updatedHours: Partial<UnformattedHours> = {
    GW_Volunteers__Status__c: "Completed",
    GW_Volunteers__Hours_Worked__c: duration,
  };

  await fetcher.patch(updateUri, updatedHours);
};
