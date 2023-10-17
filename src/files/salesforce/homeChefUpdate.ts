import { AccountData } from '../../utils/salesforce/SFQuery/fileUpload';
import { ContactAccount } from './getModel';
import { fileInfo } from './metadata';
import fetcher from '../../utils/fetcher';
import urls from '../../utils/urls';

export default async (
  fileTitles: string[],
  data: AccountData,
  contact: ContactAccount
) => {
  if (fileTitles.includes(fileInfo.FH.title)) {
    data.Home_Chef_Food_Handler_Certification__c = true;
  }
  if (fileTitles.includes(fileInfo.HC.title)) {
    data.Home_Chef_Volunteeer_Agreement__c = true;
  }
  if (fileTitles.includes(fileInfo.CKK.title)) {
    data.CK_Kitchen_Agreement__c = true;
    data.CK_Kitchen_Volunteer_Status = 'Active';
  }
  //  mark account as active if all required docs are present
  if (
    data.Home_Chef_Food_Handler_Certification__c &&
    data.Home_Chef_Volunteeer_Agreement__c
  ) {
    data.Home_Chef_Status__c = 'Active';
  }

  const accountUpdateUri =
    urls.SFOperationPrefix + '/Contact/' + contact.salesforceId;

  await fetcher.patch(accountUpdateUri, data);
};
