import fetcher from "../../../fetcher";
import urls from "../../../urls";
import { UnformattedContact } from "../contact/types";
import { UnformattedHours, Job, Shift, FormattedShift } from "./types";

interface UnformatterVolunteerRecurrenceSchedule {
  GW_Volunteers__Volunteer_Job__c: string;
  GW_Volunteers__Contact__c: string;
  GW_Volunteers__Schedule_Start_Date_Time__c: string;
  GW_Volunteers__Days_of_Week__c: string;
  GW_Volunteers__Weekly_Occurrence__c: string;
  GW_Volunteers__Duration__c: number;
}

export const getTodaysVolunteerShifts = async () => {
  await fetcher.setService("salesforce");

  const campaignQuery = `SELECT Id FROM Campaign WHERE Portal_Signups_Enabled__c = True`;
  const campaignResponse: { data: { records: { Id: string }[] } } =
    await fetcher.get(urls.SFQueryPrefix + encodeURIComponent(campaignQuery));

  const idList = [...campaignResponse.data.records.map(({ Id }) => Id)];

  let idListString = `('${idList.join("','")}')`;

  const jobQuery = `SELECT Id, Name FROM GW_Volunteers__Volunteer_Job__c WHERE GW_Volunteers__Campaign__c IN ${idListString}`;

  const { data }: { data: { records: Pick<Job, "Id" | "Name">[] } } =
    await fetcher.get(urls.SFQueryPrefix + encodeURIComponent(jobQuery));

  const jobs: Record<
    string,
    Pick<FormattedShift, "id" | "job" | "startTime" | "duration">[]
  > = {};

  const shiftPromises = data.records.map(async (job) => {
    const shiftQuery = `SELECT Id, GW_Volunteers__Start_Date_Time__c, GW_Volunteers__Duration__c FROM GW_Volunteers__Volunteer_Shift__c WHERE GW_Volunteers__Volunteer_Job__c = '${job.Id}' AND GW_Volunteers__Start_Date_Time__c = TODAY`;

    const response: {
      data: {
        records: Pick<
          Shift,
          | "Id"
          | "GW_Volunteers__Start_Date_Time__c"
          | "GW_Volunteers__Duration__c"
        >[];
      };
    } = await fetcher.get(urls.SFQueryPrefix + encodeURIComponent(shiftQuery));

    const shifts = response.data.records;

    if (shifts.length) {
      jobs[job.Id] = shifts?.map((shift) => ({
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

  const hoursQuery = `SELECT Id, GW_Volunteers__Contact__c, GW_Volunteers__Status__c FROM GW_Volunteers__Volunteer_Hours__c WHERE GW_Volunteers__Status__c != 'Canceled' AND GW_Volunteers__Volunteer_Shift__c = '${shiftId}'`;

  const hoursQueryUri = urls.SFQueryPrefix + encodeURIComponent(hoursQuery);

  const response: {
    data: {
      records: Pick<
        UnformattedHours,
        "GW_Volunteers__Contact__c" | "GW_Volunteers__Status__c" | "Id"
      >[];
    };
  } = await fetcher.get(hoursQueryUri);

  const hours = response.data.records;

  if (!hours) {
    throw Error("Could not query volunteer hours");
  }

  const idList = hours.map(
    ({ GW_Volunteers__Contact__c }) => GW_Volunteers__Contact__c
  );
  const idString = "('" + idList.join("','") + "')";

  const contactQuery = `SELECT Id, FirstName, LastName, Email, CK_Kitchen_Agreement__c FROM Contact WHERE Id IN ${idString}`;

  const {
    data,
  }: {
    data: {
      records: Pick<
        UnformattedContact,
        "Id" | "FirstName" | "LastName" | "Email" | "CK_Kitchen_Agreement__c"
      >[];
    };
  } = await fetcher.get(urls.SFQueryPrefix + contactQuery);

  const contacts = hours.map(
    ({ GW_Volunteers__Contact__c, GW_Volunteers__Status__c, Id }) => {
      const contact = data.records.find(
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

  return contacts;
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
