import fetcher from '../../../fetcher';
import urls from '../../../urls';
import { UnformattedContact } from './../contact';
import { UnformattedHours } from './../volunteer/hours';
import { Shift } from './jobs';

export const getTodaysKitchenShift = async () => {
  await fetcher.setService('salesforce');

  const shiftQuery = `SELECT Id FROM GW_Volunteers__Volunteer_Shift__c WHERE GW_Volunteers__Volunteer_Job__c = '${urls.kitchenMealPrepJobId}' AND GW_Volunteers__Start_Date_Time__c = TODAY`;

  const {
    data,
  }: {
    data?: {
      records: { Id: Pick<Shift, 'Id'> }[];
    };
  } = await fetcher.get(urls.SFQueryPrefix + encodeURIComponent(shiftQuery));

  const shift = data?.records[0];

  if (shift) {
    return shift.Id;
  }
};

export const getKitchenVolunteers = async (shiftId: string) => {
  await fetcher.setService('salesforce');

  const hoursQuery = `SELECT Id, GW_Volunteers__Contact__c, GW_Volunteers__Status__c FROM GW_Volunteers__Volunteer_Hours__c WHERE GW_Volunteers__Status__c != 'Canceled' AND GW_Volunteers__Volunteer_Shift__c = '${shiftId}'`;

  const hoursQueryUri = urls.SFQueryPrefix + encodeURIComponent(hoursQuery);

  const response: {
    data: {
      records: Pick<
        UnformattedHours,
        'GW_Volunteers__Contact__c' | 'GW_Volunteers__Status__c' | 'Id'
      >[];
    };
  } = await fetcher.get(hoursQueryUri);

  const hours = response.data.records;

  if (!hours) {
    throw Error('Could not query volunteer hours');
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
        'Id' | 'FirstName' | 'LastName' | 'Email' | 'CK_Kitchen_Agreement__c'
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

export const checkInVolunteer = async (hoursId: string) => {
  await fetcher.setService('salesforce');

  const updateUri =
    urls.SFOperationPrefix + '/GW_Volunteers__Volunteer_Hours__c/' + hoursId;

  const updatedHours: Partial<UnformattedHours> = {
    GW_Volunteers__Status__c: 'Completed',
    GW_Volunteers__Hours_Worked__c: 3,
  };

  await fetcher.patch(updateUri, updatedHours);
};
