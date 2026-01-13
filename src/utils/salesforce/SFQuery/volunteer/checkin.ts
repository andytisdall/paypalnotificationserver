import fetcher from "../../../fetcher";
import urls from "../../../urls";
import { UnformattedContact } from "../contact/types";
import createQuery, { FilterGroup } from "../queryCreator";
import { UnformattedHours, Job, Shift, FormattedShift } from "./types";
import { UnformattedVolunteerCampaign } from "./campaign/types";

export const getTodaysVolunteerShifts = async () => {
  const campaignFields = ["Id"] as const;
  const campaigObj = "Campaign";
  const campaignFilters: FilterGroup<UnformattedVolunteerCampaign> = {
    AND: [{ field: "Portal_Signups_Enabled__c", value: true }],
  };
  const campaigns = await createQuery<
    UnformattedVolunteerCampaign,
    (typeof campaignFields)[number]
  >({ fields: campaignFields, obj: campaigObj, filters: campaignFilters });

  const idList = [...campaigns.map(({ Id }) => Id)];

  let idListString = `('${idList.join("','")}')`;

  const jobFields = ["Id", "Name"] as const;
  const jobObj = "GW_Volunteers__Volunteer_Job__c";
  const jobFilters: FilterGroup<Job> = {
    AND: [
      {
        field: "GW_Volunteers__Campaign__c",
        operator: "IN",
        value: idListString,
      },
    ],
  };

  const jobs = await createQuery<Job, (typeof jobFields)[number]>({
    fields: jobFields,
    filters: jobFilters,
    obj: jobObj,
  });

  const jobsWithShifts: Record<
    string,
    Pick<FormattedShift, "id" | "job" | "startTime" | "duration">[]
  > = {};

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
          value: { date: new Date(), type: "date" },
        },
      ],
    };

    const shifts = await createQuery<Shift, (typeof fields)[number]>({
      fields,
      obj,
      filters,
    });

    if (shifts.length) {
      jobsWithShifts[job.Id] = shifts?.map((shift) => ({
        id: shift.Id,
        job: job.Name,
        startTime: shift.GW_Volunteers__Start_Date_Time__c,
        duration: shift.GW_Volunteers__Duration__c,
      }));
    }
  });

  await Promise.all(shiftPromises);

  return jobs;
};

export const getVolunteersForCheckIn = async (shiftId: string) => {
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

  const idList = hours.map(
    ({ GW_Volunteers__Contact__c }) => GW_Volunteers__Contact__c
  );
  const idString = "('" + idList.join("','") + "')";

  const contactFields = [
    "Id",
    "FirstName",
    "LastName",
    "Email",
    "CK_Kitchen_Agreement__c",
  ] as const;
  const contactObj = "Contact";
  const contactFilters: FilterGroup<UnformattedContact> = {
    AND: [{ field: "Id", operator: "IN", value: idString }],
  };

  const contacts = await createQuery<
    UnformattedContact,
    (typeof contactFields)[number]
  >({
    fields: contactFields,
    obj: contactObj,
    filters: contactFilters,
  });

  return hours.map(
    ({ GW_Volunteers__Contact__c, GW_Volunteers__Status__c, Id }) => {
      const contact = contacts.find(
        ({ Id }) => Id === GW_Volunteers__Contact__c
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
    }
  );
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

// export const createRecurringHours = async ({
//   contactId,
//   dayOfWeek,
// }: {
//   contactId: string;
//   dayOfWeek: string;
// }) => {
//   await fetcher.setService('salesforce');

//   const url =
//     urls.SFOperationPrefix + '/GW_Volunteers__Volunteer_Recurrence_Schedule__c';

//   const newVolunteerRecurrenceSchedule: UnformatterVolunteerRecurrenceSchedule =
//     {
//       GW_Volunteers__Volunteer_Job__c: urls.frontDoorJobId,
//       GW_Volunteers__Contact__c: contactId,
//       GW_Volunteers__Schedule_Start_Date_Time__c: new Date().toString(),
//       GW_Volunteers__Days_of_Week__c: dayOfWeek,
//       GW_Volunteers__Weekly_Occurrence__c: 'Every',
//       GW_Volunteers__Duration__c: 2,
//     };

//   await fetcher.post(url, newVolunteerRecurrenceSchedule);
// };

// export const getRecurringHours = async () => {
//   await fetcher.setService('salesforce');

//   const query = `SELECT GW_Volunteers__Days_of_Week__c, GW_Volunteers__Contact__c FROM GW_Volunteers__Volunteer_Recurrence_Schedule__c WHERE GW_Volunteers__Volunteer_Job__c = '${urls.frontDoorJobId}'`;

//   const {
//     data,
//   }: {
//     data: {
//       records: Pick<
//         UnformatterVolunteerRecurrenceSchedule,
//         'GW_Volunteers__Days_of_Week__c' | 'GW_Volunteers__Contact__c'
//       >[];
//     };
//   } = await fetcher.get(urls.SFQueryPrefix + encodeURIComponent(query));

//   return data.records.map((sched) => ({
//     dayOfWeek: sched.GW_Volunteers__Days_of_Week__c,
//     contactId: sched.GW_Volunteers__Contact__c,
//   }));
// };
