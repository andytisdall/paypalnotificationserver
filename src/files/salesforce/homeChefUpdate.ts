import { AccountData } from '../../utils/salesforce/SFQuery/fileUpload';
import { fileInfo } from './metadata';
import fetcher from '../../utils/fetcher';
import urls from '../../utils/urls';

export default async (fileTitles: string[], contact: AccountData) => {
  const patchData: Partial<AccountData> = {};
  if (fileTitles.includes(fileInfo.FH.title)) {
    patchData.Home_Chef_Food_Handler_Certification__c = true;
  }
  if (fileTitles.includes(fileInfo.HC.title)) {
    patchData.Home_Chef_Volunteeer_Agreement__c = true;
  }
  if (fileTitles.includes(fileInfo.CKK.title)) {
    patchData.CK_Kitchen_Agreement__c = true;
    patchData.CK_Kitchen_Volunteer_Status__c = 'Active';
  }
  //  mark account as active if all required docs are present
  const foodHandlerPresent =
    contact.Home_Chef_Food_Handler_Certification__c ||
    patchData.Home_Chef_Food_Handler_Certification__c;
  const homeChefAgreementPresent =
    contact.Home_Chef_Volunteeer_Agreement__c ||
    patchData.Home_Chef_Volunteeer_Agreement__c;

  if (foodHandlerPresent && homeChefAgreementPresent) {
    patchData.Home_Chef_Status__c = 'Active';
  }

  const accountUpdateUri = urls.SFOperationPrefix + '/Contact/' + contact.Id;

  await fetcher.patch(accountUpdateUri, patchData);
};
