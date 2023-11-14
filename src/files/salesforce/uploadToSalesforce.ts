import { Account } from './getModel';
import { FileWithType, fileInfo } from './metadata';
import fetcher from '../../utils/fetcher';
import urls from '../../utils/urls';
import {
  AccountData,
  formatFilename,
  deleteFiles,
  insertFile,
} from '../../utils/salesforce/SFQuery/fileUpload';
import updateRestaurant from './mealProgramUpdate';
import updateContact from './homeChefUpdate';

export const uploadFiles = async (
  account: Account,
  files: FileWithType[],
  date?: string
) => {
  await fetcher.setService('salesforce');
  const objectType = { contact: '/Contact/', restaurant: '/Account/' };
  const accountGetUri =
    urls.SFOperationPrefix + objectType[account.type] + account.salesforceId;
  const { data }: { data: AccountData } = await fetcher.get(accountGetUri);

  let fileTitles = files.map((f) => fileInfo[f.docType].title);

  const formattedTitles = files.map((file) => {
    return formatFilename(fileInfo[file.docType], account);
  });
  // make sure health permit and expiration date are together
  const healthPermitPresent = fileTitles.includes('Health Department Permit');

  if ((healthPermitPresent && !date) || (date && !healthPermitPresent)) {
    throw Error(
      'Health Permit must be updated at the same time as expiration date'
    );
  }
  // if there are existing files that will be replaced, delete them
  if (
    data.Home_Chef_Food_Handler_Certification__c ||
    data.Home_Chef_Volunteeer_Agreement__c ||
    data.Meal_Program_Onboarding__c
  ) {
    await deleteFiles(account.salesforceId, formattedTitles);
  }

  // add files
  const insertPromises = files.map((f) => insertFile(account, f));
  await Promise.all(insertPromises);

  // update account
  if (account.type === 'contact') {
    await updateContact(fileTitles, data);
  }
  if (account.type === 'restaurant') {
    await updateRestaurant(fileTitles, data, account, date);
  }

  return files.map((f) => {
    return { docType: f.docType, ...fileInfo[f.docType] };
  });
};
