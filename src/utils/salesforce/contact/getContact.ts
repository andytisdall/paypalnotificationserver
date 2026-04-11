import fetcher from "../../fetcher";
import urls from "../../urls";
import createQuery, { FilterGroup } from "../queryCreator";

import { ContactData, UnformattedContact, D4JContact } from "./types";

export const getContact = async (
  lastName: string,
  firstName: string,
): Promise<ContactData | null> => {
  const escapedFirstName = firstName.replace(/'/g, "\\'");
  const escapedLastName = lastName.replace(/'/g, "\\'");

  const fields = [
    "Name",
    "npsp__HHId__c",
    "Id",
    "Portal_Username__c",
    "Email",
    "FirstName",
    "LastName",
    "CK_Kitchen_Agreement__c",
  ] as const;
  const obj = "Contact";
  const filters: FilterGroup<UnformattedContact> = {
    AND: [
      { field: "LastName", value: escapedLastName },
      { field: "FirstName", value: escapedFirstName },
    ],
  };

  const contacts = await createQuery<
    UnformattedContact,
    (typeof fields)[number]
  >({
    fields,
    obj,
    filters,
  });

  const contact = contacts[0];
  if (contact) {
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
  } else {
    return null;
  }
};

export const getContactByLastNameAndEmail = async (
  lastName: string,
  email: string,
): Promise<ContactData | null> => {
  const escapedLastName = lastName.replace(/'/g, "\\'");
  const fields = [
    "Name",
    "npsp__HHId__c",
    "Id",
    "Portal_Username__c",
    "Email",
    "FirstName",
    "LastName",
    "CK_Kitchen_Agreement__c",
  ] as const;
  const obj = "Contact";
  const filters: FilterGroup<UnformattedContact> = {
    AND: [
      { field: "LastName", value: escapedLastName },
      { field: "Email", value: email },
    ],
  };

  const contacts = await createQuery<
    UnformattedContact,
    (typeof fields)[number]
  >({
    fields,
    filters,
    obj,
  });

  const contact = contacts[0];
  if (contact) {
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
  } else {
    return null;
  }
};

export const getContactById = async (id: string) => {
  await fetcher.setService("salesforce");
  const res: { data: UnformattedContact | undefined } = await fetcher.get(
    urls.SFOperationPrefix + "/Contact/" + id,
  );
  if (!res.data?.LastName) {
    throw Error("Contact not found");
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
  email: string,
): Promise<ContactData | null> => {
  const fields = [
    "Name",
    "FirstName",
    "LastName",
    "Email",
    "npsp__HHId__c",
    "Id",
    "Portal_Username__c",
    "CK_Kitchen_Agreement__c",
  ] as const;
  const obj = "Contact";
  const filters: FilterGroup<UnformattedContact> = {
    AND: [{ field: "Email", value: email }],
  };

  const contacts = await createQuery<
    UnformattedContact,
    (typeof fields)[number]
  >({ fields, filters, obj });

  const contact = contacts[0];
  if (contact) {
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
  } else {
    return null;
  }
};

export const getUnformattedContactByEmail = async (
  email: string,
): Promise<UnformattedContact | undefined> => {
  await fetcher.setService("salesforce");

  const fields = ["Id"] as const;
  const obj = "Contact";
  const filters: FilterGroup<UnformattedContact> = {
    AND: [{ field: "Email", value: email }],
  };

  const contacts = await createQuery<
    UnformattedContact,
    (typeof fields)[number]
  >({ fields, obj, filters });

  const contact = contacts[0];

  if (contact?.Id) {
    const unformattedContact = await getContactById(contact.Id);
    return unformattedContact;
  }
};

export const getContactByPhoneNumber = async (
  phoneNumber: string,
): Promise<string | null> => {
  await fetcher.setService("salesforce");

  const fields = ["Id"] as const;
  const obj = "Contact";
  const filters: FilterGroup<UnformattedContact> = {
    AND: [{ field: "Phone", value: phoneNumber }],
  };

  const contacts = await createQuery<
    UnformattedContact,
    (typeof fields)[number]
  >({ fields, obj, filters });

  const contact = contacts[0];

  return contact?.Id;
};
