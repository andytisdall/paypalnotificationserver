import { FileWithType, fileInfo } from './metadata';
import fetcher from '../../utils/fetcher';
import urls from '../../utils/urls';
import {
  AccountData,
  formatFilename,
  deleteFiles,
  insertFile,
} from '../../utils/salesforce/SFQuery/fileUpload';
import { UnformattedContact } from '../../utils/salesforce/SFQuery/contact';

export const uploadFiles = async (
  contact: UnformattedContact,
  files: FileWithType[]
) => {
  await fetcher.setService('salesforce');
  const accountGetUri = urls.SFOperationPrefix + '/Contact/' + contact.Id;
  const { data }: { data: AccountData } = await fetcher.get(accountGetUri);

  const formattedTitles = files.map((file) => {
    return formatFilename(fileInfo[file.docType], contact.LastName!);
  });

  if (
    data.Home_Chef_Food_Handler_Certification__c ||
    data.Home_Chef_Volunteeer_Agreement__c
  ) {
    await deleteFiles(contact.Id!, formattedTitles);
  }

  // add files
  const insertPromises = files.map((f) => insertFile(contact, f));
  await Promise.all(insertPromises);

  return files.map((f) => {
    return { docType: f.docType, ...fileInfo[f.docType] };
  });
};
