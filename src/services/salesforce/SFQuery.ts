import urls from '../urls';
import fetcher from '../fetcher';

interface ContactInfo {
  FirstName?: string;
  LastName?: string;
  Email?: string;
  HomePhone?: string;
  GW_Volunteers__Volunteer_Availability__c?: string;
  GW_Volunteers__Volunteer_Skills__c?: string;
  GW_Volunteers__Volunteer_Status__c?: string;
  GW_Volunteers__Volunteer_Notes__c?: string;
  Instagram_Handle__c?: string;
  Able_to_Commit__c?: string;
  Able_to_get_food_handler_cert__c?: string;
  Cooking_Experience__c?: string;
  Able_to_attend_orientation__c?: string;
  Meal_Transportation__c?: string;
  How_did_they_hear_about_CK__c?: string;
  Portal_Username__c?: string;
  Portal_Temporary_Password__c?: string;
  Home_Chef_Status__c?: string;
}

export interface Contact {
  householdId: string;
  name?: string;
  id: string;
}

export interface UnformattedContact {
  npsp__HHId__c: string;
  Id: string;
  Name: string;
}

export const getContact = async (lastName: string, email: string) => {
  await fetcher.setService('salesforce');
  const query = `SELECT Name, npsp__HHId__c, Id from Contact WHERE LastName = '${lastName}' AND Email = '${email}'`;

  const contactQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const contactQueryResponse: {
    data: { records: UnformattedContact[] | undefined; totalSize: number };
  } = await fetcher.get(contactQueryUri);
  if (
    !contactQueryResponse.data.records ||
    contactQueryResponse.data.records.length === 0
  ) {
    return null;
  } else {
    const contact = contactQueryResponse.data.records[0];
    return {
      id: contact.Id,
      name: contact.Name,
      householdId: contact.npsp__HHId__c,
    };
  }
};

export const addContact = async (contactToAdd: ContactInfo) => {
  await fetcher.setService('salesforce');
  const contactInsertUri = urls.SFOperationPrefix + '/Contact';
  const insertRes = await fetcher.post(contactInsertUri, contactToAdd);
  //Query new contact to get household account number for opp
  if (insertRes.data.success) {
    const newContact: {
      data: UnformattedContact | undefined;
    } = await fetcher.get(contactInsertUri + '/' + insertRes.data.id);
    if (!newContact.data?.Name) {
      throw Error('Could not get created contact');
    }
    return {
      id: newContact.data.Id,
      householdId: newContact.data.npsp__HHId__c,
      name: newContact.data.Name,
    };
  } else {
    throw new Error('Unable to insert contact!');
  }
};

export const updateContact = async (
  id: string,
  contactToUpdate: ContactInfo
) => {
  await fetcher.setService('salesforce');
  const contactUpdateUri = urls.SFOperationPrefix + '/Contact/' + id;
  await fetcher.patch(contactUpdateUri, contactToUpdate);
};

export const getContactById = async (id: string) => {
  await fetcher.setService('salesforce');
  const res = await fetcher.get(urls.SFOperationPrefix + '/Contact/' + id);
  return res.data;
};
