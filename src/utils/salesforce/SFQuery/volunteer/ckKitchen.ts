import fetcher from '../../../fetcher';
import urls from '../../../urls';
import { UnformattedContact } from './../contact';
import { UnformattedHours } from './../volunteer/hours';

export const getTodaysKitchenVolunteers = async () => {
  await fetcher.setService('salesforce');

  const hoursQuery = `SELECT Id, GW_Volunteers__Contact__c, GW_Volunteers__Status__c FROM GW_Volunteers__Volunteer_Hours__c WHERE GW_Volunteers__Volunteer_Campaign__c = '${urls.ckKitchenCampaignId}' AND GW_Volunteers__Status__c != 'Canceled' AND GW_Volunteers__Start_Date__c = TODAY`;

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

  return hours.map(
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
          agreementSigned: contact.CK_Kitchen_Agreement__c,
          status: GW_Volunteers__Status__c,
        };
      }
    }
  );
};

export const checkInVolunteer = async (hoursId: string) => {
  await fetcher.setService('salesforce');

  const updateUri =
    urls.SFOperationPrefix + '/GW_Volunteers__Volunteer_Hours__c/' + hoursId;

  await fetcher.patch(updateUri, { GW_Volunteers__Status__c: 'Completed' });
};
