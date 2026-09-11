import { InsertSuccessResponse } from "../reusableTypes";
import { UnformattedContact } from "./types";
import { Volunteer } from "@community-kitchens/apiinterfaces";
import fetcher from "../../fetcher";
import urls from "../../urls";
import { formatContact, getContactById } from "./getContact";

export const addContact = async (
  contactToAdd: Partial<UnformattedContact>,
): Promise<Volunteer> => {
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
      return formatContact(newContact.data);
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

      return formatContact(contact);
    } else {
      throw new Error(err as string);
    }
  }
};
