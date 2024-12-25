import fetcher from '../../../fetcher';
import urls from '../../../urls';
import { UnformattedContact } from './../contact';
import { UnformattedHours } from './../volunteer/hours';

export const getTodaysKitchenVolunteers = async () => {
  await fetcher.setService('salesforce');

  const hoursQuery = `SELECT GW_Volunteers__Contact__c FROM GW_Volunteers__Volunteer_Hours__c WHERE GW_Volunteers__Volunteer_Campaign__c = ${urls.ckKitchenCampaignId} AND Status != 'Canceled' AND GW_Volunteers__Start_Date__c = TODAY`;

  const hoursQueryUri = urls.SFQueryPrefix + encodeURIComponent(hoursQuery);

  const response: {
    data: { records: Pick<UnformattedHours, 'GW_Volunteers__Contact__c'>[] };
  } = await fetcher.get(hoursQueryUri);
  if (!response.data?.records) {
    throw Error('Could not query volunteer hours');
  }

  const idList = response.data.records.map(
    ({ GW_Volunteers__Contact__c }) => GW_Volunteers__Contact__c
  );
  const idString = "('" + idList.join("','") + "')";

  const contactQuery = `SELECT FirstName, LastName, Email, CK_Kitchen_Agreement__c FROM Contact WHERE Id IN ${idString}`;

  const {
    data,
  }: {
    data: {
      records: Pick<
        UnformattedContact,
        'FirstName' | 'LastName' | 'Email' | 'CK_Kitchen_Agreement__c'
      >[];
    };
  } = await fetcher.get(urls.SFQueryPrefix + contactQuery);

  return data.records.map((contact) => {
    return {
      firstName: contact.FirstName,
      lastName: contact.LastName,
      email: contact.Email,
      agreementSigned: contact.CK_Kitchen_Agreement__c,
    };
  });
};
