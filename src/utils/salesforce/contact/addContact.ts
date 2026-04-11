import { InsertSuccessResponse } from "../reusableTypes";
import { ContactData, UnformattedContact, D4JContact } from "./types";
import fetcher from "../../fetcher";
import urls from "../../urls";
import { getContactById } from "./getContact";

export const addContact = async (
  contactToAdd: Partial<UnformattedContact>,
): Promise<ContactData> => {
  await fetcher.setService("salesforce");
  const contactInsertUri = urls.SFOperationPrefix + "/Contact";

  try {
    const insertRes: { data: InsertSuccessResponse | undefined } =
      await fetcher.post(contactInsertUri, contactToAdd);
    //Query new contact to get household account number for opp
    if (insertRes.data?.success) {
      const newContact: {
        data: UnformattedContact | undefined;
      } = await fetcher.get(contactInsertUri + "/" + insertRes.data.id);
      if (!newContact.data?.Name) {
        throw Error("Could not get created contact");
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
      throw new Error("Unable to insert contact!");
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
