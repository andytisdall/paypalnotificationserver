import fetcher from '../../fetcher';
import urls from '../../urls';
import { InsertSuccessResponse } from './reusableTypes';

export interface UnformattedContact {
  Name: string;
  FirstName?: string;
  LastName: string;
  Email?: string;
  HomePhone?: string;
  GW_Volunteers__Volunteer_Skills__c?: string;
  GW_Volunteers__Volunteer_Status__c?: string;
  GW_Volunteers__Volunteer_Notes__c?: string;
  Instagram_Handle__c?: string;
  Able_to_get_food_handler_cert__c?: boolean;
  Able_to_get_food_handler_other__c?: string;
  Able_to_work_on_feet__c?: boolean;
  Able_to_work_on_feet_other__c?: string;
  Cooking_Experience__c?: string;
  How_did_they_hear_about_CK__c?: string;
  Portal_Username__c?: string;
  Portal_Temporary_Password__c?: string;
  Home_Chef_Status__c?: string;
  Id: string;
  Home_Chef_Volunteeer_Agreement__c?: boolean;
  Home_Chef_Food_Handler_Certification__c?: boolean;
  npsp__HHId__c: string;
  Interest_in_other_volunteer_programs__c?: string;
  Able_to_Commit__c?: boolean;
  Able_to_cook_and_transport_other__c?: string;
  Home_Chef_Quiz_Passed__c?: boolean;
  CK_Kitchen_Agreement__c?: boolean;
  CK_Kitchen_Volunteer_Status__c?: string;
}

export interface FormattedContact {
  householdId: string;
  name: string;
  id: string;
  portalUsername?: string;
  firstName?: string;
  lastName: string;
  volunteerAgreement?: boolean;
  foodHandler?: boolean;
  ckKitchenStatus?: string;
  homeChefAgreement: boolean;
  homeChefStatus?: string;
  homeChefQuizPassed?: boolean;
  email?: string;
}

export interface D4JContact {
  firstName: string;
  email: string;
  id: string;
  d4jPoints?: number;
}

type ContactRawData = Pick<
  UnformattedContact,
  | 'Id'
  | 'Name'
  | 'npsp__HHId__c'
  | 'Portal_Username__c'
  | 'Email'
  | 'FirstName'
  | 'LastName'
  | 'CK_Kitchen_Agreement__c'
>;

export type ContactData = Pick<
  FormattedContact,
  | 'id'
  | 'name'
  | 'householdId'
  | 'portalUsername'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'volunteerAgreement'
>;

export const getContact = async (
  lastName: string,
  firstName: string
): Promise<ContactData | null> => {
  await fetcher.setService('salesforce');
  const query = `SELECT Name, npsp__HHId__c, Id, Portal_Username__c, Email, FirstName, LastName, CK_Kitchen_Agreement__c from Contact WHERE LastName = '${lastName}' AND FirstName = '${firstName}'`;

  const contactQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const contactQueryResponse: {
    data: {
      records: ContactRawData[] | undefined;
      totalSize: number;
    };
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
      portalUsername: contact.Portal_Username__c,
      email: contact.Email,
      firstName: contact.FirstName,
      lastName: contact.LastName,
      volunteerAgreement: contact.CK_Kitchen_Agreement__c,
    };
  }
};

export const getContactByLastNameAndEmail = async (
  lastName: string,
  email: string
): Promise<ContactData | null> => {
  await fetcher.setService('salesforce');
  const query = `SELECT Name, npsp__HHId__c, Id, Portal_Username__c, Email, FirstName, LastName, CK_Kitchen_Agreement__c from Contact WHERE LastName = '${lastName}' AND Email = '${email}'`;

  const contactQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const contactQueryResponse: {
    data: {
      records: ContactRawData[] | undefined;
      totalSize: number;
    };
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
      portalUsername: contact.Portal_Username__c,
      email: contact.Email,
      firstName: contact.FirstName,
      lastName: contact.LastName,
      volunteerAgreement: contact.CK_Kitchen_Agreement__c,
    };
  }
};

export const addContact = async (
  contactToAdd: Partial<UnformattedContact>
): Promise<ContactData> => {
  await fetcher.setService('salesforce');
  const contactInsertUri = urls.SFOperationPrefix + '/Contact';

  try {
    const insertRes: { data: InsertSuccessResponse | undefined } =
      await fetcher.post(contactInsertUri, contactToAdd);
    //Query new contact to get household account number for opp
    if (insertRes.data?.success) {
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
        email: newContact.data.Email,
        portalUsername: newContact.data.Portal_Username__c,
        firstName: newContact.data.FirstName,
        lastName: newContact.data.LastName,
        volunteerAgreement: newContact.data.CK_Kitchen_Agreement__c,
      };
    } else {
      throw new Error('Unable to insert contact!');
    }
  } catch (err) {
    // if a duplicate error comes back, get that contact and return it

    const duplicateRecordId =
      // @ts-ignore
      err?.response?.data[0]?.duplicateResult?.matchResults[0]?.matchRecords[0]
        ?.record?.Id;

    if (duplicateRecordId) {
      const contact = await getContactById(duplicateRecordId);

      return {
        id: contact.Id,
        householdId: contact.npsp__HHId__c,
        name: contact.Name,
        email: contact.Email || contactToAdd.Email,
        portalUsername: contact.Portal_Username__c,
        firstName: contact.FirstName,
        lastName: contact.LastName,
        volunteerAgreement: contact.CK_Kitchen_Agreement__c,
      };
    } else {
      throw err;
    }
  }
};

export const updateContact = async (
  id: string,
  contactToUpdate: Partial<UnformattedContact>
) => {
  await fetcher.setService('salesforce');
  const contactUpdateUri = urls.SFOperationPrefix + '/Contact/' + id;
  await fetcher.patch(contactUpdateUri, contactToUpdate);
};

export const getContactById = async (id: string) => {
  await fetcher.setService('salesforce');
  const res: { data: UnformattedContact | undefined } = await fetcher.get(
    urls.SFOperationPrefix + '/Contact/' + id
  );
  if (!res.data?.LastName) {
    throw Error('Contact not found');
  }
  return res.data;
};

export const getD4JContact = async (id: string): Promise<D4JContact> => {
  const contact = await getContactById(id);
  return {
    email: contact.Email!,
    firstName: contact.FirstName!,
    id: contact.Id!,
  };
};

// this contact query just searches by email because people's names and
// email addresses don't always match up on paypal

export const getContactByEmail = async (
  email: string
): Promise<ContactData | null> => {
  await fetcher.setService('salesforce');

  const query = `SELECT Name, FirstName, LastName, Email, npsp__HHId__c, Id, Portal_Username__c, CK_Kitchen_Agreement__c from Contact WHERE Email = '${email}'`;
  const contactQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const contactQueryResponse: {
    data:
      | {
          records: ContactRawData[];
        }
      | undefined;
  } = await fetcher.get(contactQueryUri);
  if (!contactQueryResponse.data?.records[0]) {
    return null;
  }
  const contact = contactQueryResponse.data?.records[0];
  return {
    id: contact.Id,
    householdId: contact.npsp__HHId__c,
    portalUsername: contact.Portal_Username__c,
    firstName: contact.FirstName,
    name: contact.Name,
    lastName: contact.LastName,
    volunteerAgreement: contact.CK_Kitchen_Agreement__c,
    email: contact.Email,
  };
};

export const getUnformattedContactByEmail = async (
  email: string
): Promise<UnformattedContact | undefined> => {
  await fetcher.setService('salesforce');

  const query = `SELECT Id from Contact WHERE Email = '${email}'`;
  const contactQueryUri = urls.SFQueryPrefix + encodeURIComponent(query);

  const contactQueryResponse: {
    data: { records: UnformattedContact[] } | undefined;
  } = await fetcher.get(contactQueryUri);
  if (!contactQueryResponse.data?.records[0]) {
    return undefined;
  }
  const contact = contactQueryResponse.data?.records[0];

  if (contact.Id) {
    const unformattedContact = await getContactById(contact.Id);
    return unformattedContact;
  }
};

// const formatContact = (
//   contact: UnformattedContact
// ): Pick<
//   FormattedContact,
//   | 'id'
//   | 'householdId'
//   | 'portalUsername'
//   | 'firstName'
//   | 'name'
//   | 'lastName'
//   | 'ckKitchenStatus'
// > => {
//   return {
//     id: contact.Id,
//     householdId: contact.npsp__HHId__c,
//     portalUsername: contact.Portal_Username__c,
//     firstName: contact.FirstName,
//     name: contact.Name,
//     lastName: contact.LastName,
//     ckKitchenStatus: contact.CK_Kitchen_Volunteer_Status__c,
//   };
// };

export const deleteContact = async (id: string) => {
  await fetcher.setService('salesforce');
  await fetcher.delete(urls.SFOperationPrefix + '/Contact/' + id);
};
