import FormData from 'form-data';
import path from 'path';

import urls from '../utils/urls';
import fetcher from '../utils/fetcher';
import { Account, RestaurantAccount, ContactAccount } from './getModel';

export type RestaurantDocType = 'BL' | 'HD' | 'RC' | 'W9' | 'DD' | 'IN';
export type ContactDocType = 'HC' | 'FH';
export type DocType = RestaurantDocType | ContactDocType;

interface FileMetaData {
  title: string;
  description: string;
  folder: string;
}

type FileInfo = Record<DocType, FileMetaData>;

type AccountData = {
  Health_Department_Expiration_Date__c?: string;
  Meal_Program_Onboarding__c?: string;
  Meal_Program_Status__c?: string;
  Home_Chef_Food_Handler_Certification__c?: boolean;
  Home_Chef_Volunteeer_Agreement__c?: boolean;
  Home_Chef_Status__c?: string;
};

export const restaurantFileInfo: Record<RestaurantDocType, FileMetaData> = {
  BL: {
    title: 'Business License',
    description: '',
    folder: 'meal-program',
  },
  HD: {
    title: 'Health Department Permit',
    description: '',
    folder: 'meal-program',
  },
  RC: { title: 'Restaurant Contract', description: '', folder: 'meal-program' },
  W9: { title: 'W9', description: '', folder: 'meal-program' },
  DD: {
    title: 'Direct Deposit Form',
    description: '',
    folder: 'meal-program',
  },
  IN: {
    title: 'Insurance',
    description: '',
    folder: 'meal-program',
  },
};

export const chefFileInfo: Record<ContactDocType, FileMetaData> = {
  HC: { title: 'VOL_AGREEMENT_', description: '', folder: 'home-chef' },
  FH: {
    title: 'FOOD_HANDLER_',
    description: '',
    folder: 'home-chef',
  },
};

const fileInfo: FileInfo = {
  ...restaurantFileInfo,
  ...chefFileInfo,
};

export interface File {
  docType: DocType;
  file: {
    data: Buffer;
    name: string;
  };
}

export type FileList = File[];

export const uploadFiles = async (
  account: Account,
  files: FileList,
  date?: string
) => {
  await fetcher.setService('salesforce');
  const objectType = { contact: '/Contact/', restaurant: '/Account/' };
  const accountGetUri =
    urls.SFOperationPrefix + objectType[account.type] + account.salesforceId;
  const { data }: { data: AccountData } = await fetcher.get(accountGetUri);

  let fileTitles = files.map((f) => fileInfo[f.docType].title);

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
    if (account.type === 'contact') {
      fileTitles = fileTitles.map(
        (title) => title + account.lastName?.toUpperCase()
      );
    }
    await deleteFiles(account.salesforceId, fileTitles);
  }

  // add files
  const insertPromises = files.map((f) => insertFile(account, f));
  await Promise.all(insertPromises);

  // update account
  if (account.type === 'contact') {
    await updateContact(fileTitles, data, account);
  }
  if (account.type === 'restaurant') {
    await updateRestaurant(fileTitles, data, account, date);
  }

  return files.map((f) => fileInfo[f.docType].title);
};

const insertFile = async (account: Account, file: File) => {
  const typeOfFile = fileInfo[file.docType];

  const title =
    account.type === 'contact'
      ? typeOfFile.title + account.lastName.toUpperCase()
      : typeOfFile.title;

  const fileMetaData = {
    Title: title,
    Description: typeOfFile.description,
    PathOnClient:
      account.name + '/' + typeOfFile.folder + path.extname(file.file.name),
  };

  const postBody = new FormData();
  postBody.append('entity_document', JSON.stringify(fileMetaData), {
    contentType: 'application/json',
  });

  postBody.append('VersionData', file.file.data, { filename: file.file.name });
  let contentVersionId;

  let res = await fetcher.post(
    urls.SFOperationPrefix + '/ContentVersion/',
    postBody,
    {
      headers: postBody.getHeaders(),
    }
  );
  console.log('Content Version created: ' + res.data.id);
  contentVersionId = res.data.id;

  const ContentDocumentId = await getDocumentId(contentVersionId);
  const accountId = account.salesforceId;

  const CDLinkData = {
    ShareType: 'I',
    LinkedEntityId: accountId,
    ContentDocumentId,
  };

  await fetcher.post(
    urls.SFOperationPrefix + '/ContentDocumentLink/',
    CDLinkData,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  console.log('File Linked to Account: ' + res.data.id);
};

const getDocumentId = async (CVId: string) => {
  const documentQuery = [
    'SELECT',
    'ContentDocumentId',
    'from',
    'ContentVersion',
    'WHERE',
    'Id',
    '=',
    `'${CVId}'`,
  ];

  const documentQueryUri = urls.SFQueryPrefix + documentQuery.join('+');

  const documentQueryResponse = await fetcher.get(documentQueryUri);
  return documentQueryResponse.data.records[0].ContentDocumentId;
};

const updateRestaurant = async (
  fileTitles: string[],
  data: AccountData,
  restaurant: RestaurantAccount,
  date?: string
) => {
  if (data.Meal_Program_Onboarding__c) {
    const docs = [
      ...new Set([
        ...data.Meal_Program_Onboarding__c.split(';'),
        ...fileTitles,
      ]),
    ];
    data.Meal_Program_Onboarding__c = docs.join(';') + ';';
  } else {
    data.Meal_Program_Onboarding__c = fileTitles.join(';') + ';';
  }

  if (date) {
    data.Health_Department_Expiration_Date__c = date;
  }
  //  mark account as active if all required docs are present

  const allDocs = Object.values(restaurantFileInfo).map((doc) => doc.title);
  const dateExists = !!(date || data.Health_Department_Expiration_Date__c);
  if (allDocs.every((doc) => Object.values(data).includes(doc)) && dateExists) {
    data.Meal_Program_Status__c = 'Active';
  }

  const restaurantUpdateUri =
    urls.SFOperationPrefix + '/Account/' + restaurant.salesforceId;

  const updateData: Partial<AccountData> = {
    Health_Department_Expiration_Date__c: date,
    Meal_Program_Status__c: data.Meal_Program_Status__c,
    Meal_Program_Onboarding__c: data.Meal_Program_Onboarding__c,
  };

  await fetcher.patch(restaurantUpdateUri, updateData);
};

const updateContact = async (
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
  //  mark account as active if all required docs are present
  if (
    data.Home_Chef_Food_Handler_Certification__c &&
    data.Home_Chef_Volunteeer_Agreement__c
  ) {
    data.Home_Chef_Status__c = 'Active';
  }

  const accountUpdateUri =
    urls.SFOperationPrefix + '/Contact/' + contact.salesforceId;

  const updateData: Partial<AccountData> = {
    Home_Chef_Food_Handler_Certification__c:
      data.Home_Chef_Food_Handler_Certification__c,
    Home_Chef_Volunteeer_Agreement__c: data.Home_Chef_Volunteeer_Agreement__c,
    Home_Chef_Status__c: data.Home_Chef_Status__c,
  };

  await fetcher.patch(accountUpdateUri, updateData);
};

const deleteFiles = async (id: string, newFiles: string[]) => {
  // get all cdlinks tied to that account
  const CDLinkQuery = `SELECT ContentDocumentId from ContentDocumentLink WHERE LinkedEntityId = '${id}'`;

  const CDLinkQueryUri = urls.SFQueryPrefix + encodeURIComponent(CDLinkQuery);

  const CDLinkQueryResponse: {
    data: { records: { ContentDocumentId: string }[] };
  } = await fetcher.get(CDLinkQueryUri);
  // then get all content documents from the CDIds in the cdlinks
  if (!CDLinkQueryResponse.data.records) {
    throw Error('Failed querying for ContentDocumentLink');
  }

  const getPromises = CDLinkQueryResponse.data.records.map(
    async ({ ContentDocumentId }) => {
      const ContentDocUri =
        urls.SFOperationPrefix + '/ContentDocument/' + ContentDocumentId;
      const { data } = await fetcher.get(ContentDocUri);
      // then search those for the titles that we're replacing
      return data;
    }
  );
  const ContentDocs = await Promise.all(getPromises);

  const DocsToDelete = ContentDocs.filter((cd) => {
    return newFiles.includes(cd.Title);
  });
  // then delete those
  const deletePromises = DocsToDelete.map(async (cd) => {
    const ContentDocUri = urls.SFOperationPrefix + '/ContentDocument/' + cd.Id;
    await fetcher.delete(ContentDocUri);
  });
  await Promise.all(deletePromises);

  // content document links will be deleted automatically
};
