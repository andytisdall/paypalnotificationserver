import fetcher from "../../fetcher";
import urls from "../../urls";
import { UnformattedContact } from "./types";

export const updateContact = async (
  id: string,
  contactToUpdate: Partial<UnformattedContact>,
) => {
  await fetcher.setService("salesforce");
  const contactUpdateUri = urls.SFOperationPrefix + "/Contact/" + id;
  await fetcher.patch(contactUpdateUri, contactToUpdate);
};

export const deleteContact = async (id: string) => {
  await fetcher.setService("salesforce");
  await fetcher.delete(urls.SFOperationPrefix + "/Contact/" + id);
};
