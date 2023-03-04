import FormData from 'form-data';
import path from 'path';

import urls from '../services/urls';
import fetcher from '../services/fetcher';
import { Account, AccountType, getAccountForFileUpload } from './getModel';

export type DocType = 'BL' | 'HD' | 'RC' | 'W9' | 'DD' | 'HC' | 'FH';

interface FileMetaData {
  title: string;
  description: string;
  folder: string;
}

type FileInfo = Record<DocType, FileMetaData>;

export const restaurantFileInfo = {
  BL: {
    title: 'Business License',
    description: '',
    folder: 'business-license',
  },
  HD: {
    title: 'Health Department Permit',
    description: '',
    folder: 'health-department-permit',
  },
  RC: { title: 'Restaurant Contract', description: '', folder: 'contract' },
  W9: { title: 'W9', description: '', folder: 'w9' },
  DD: {
    title: 'Direct Deposit Form',
    description: '',
    folder: 'direct-deposit',
  },
};

export const chefFileInfo = {
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
  accountId: string,
  files: FileList,
  accountType: AccountType,
  date?: string
) => {
  await fetcher.setService('salesforce');
  const account: Account | undefined = await getAccountForFileUpload(
    accountType,
    accountId
  );
  if (!account) {
    throw Error('Could not get account');
  }
  await updateAccount(account, files, accountType, date);
  const insertPromises = files.map((f) => insertFile(account, f));
  await Promise.all(insertPromises);
  return files.map((f) => fileInfo[f.docType].title);
};

const insertFile = async (account: Account, file: File) => {
  const typeOfFile = fileInfo[file.docType];

  const title = account.lastName
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

export const updateAccount = async (
  account: Account,
  files: FileList,
  accountType: AccountType,
  date?: string
) => {
  type FileTypes = {
    Health_Department_Expiration_Date__c?: string;
    Meal_Program_Onboarding__c?: string;
    Home_Chef_Food_Handler_Certification__c?: boolean;
    Home_Chef_Volunteeer_Agreement__c?: boolean;
    Home_Chef_Status__c?: string;
    Meal_Program_Status__c?: string;
  };

  const data: FileTypes = {};

  let accountURL;
  if (accountType === 'restaurant') {
    accountURL = '/Account/';
  }
  if (accountType === 'contact') {
    accountURL = '/Contact/';
  }

  const accountGetUri =
    urls.SFOperationPrefix + accountURL + account.salesforceId;
  const res: { data: FileTypes } = await fetcher.get(accountGetUri);

  const existingDocuments = {
    mealProgram: res.data.Meal_Program_Onboarding__c,
    healthExpiration: res.data.Health_Department_Expiration_Date__c,
    foodHandler: res.data.Home_Chef_Food_Handler_Certification__c,
    volunteerAgreement: res.data.Home_Chef_Volunteeer_Agreement__c,
  };

  //  mark account as active if all required docs are present

  let fileTitles = files.map((f) => fileInfo[f.docType].title);

  if (accountType === 'restaurant') {
    if (existingDocuments.mealProgram) {
      const docs = [
        ...new Set([
          ...existingDocuments.mealProgram.split(';'),
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
    const allDocs = Object.values(restaurantFileInfo).map((doc) => doc.title);
    const dateExists = !!(date || existingDocuments.healthExpiration);
    if (
      allDocs.every((doc) => Object.values(data).includes(doc)) &&
      dateExists
    ) {
      data.Meal_Program_Status__c = 'Active';
    }
  }

  if (accountType === 'contact') {
    if (fileTitles.includes(fileInfo.FH.title)) {
      data.Home_Chef_Food_Handler_Certification__c = true;
    }
    if (fileTitles.includes(fileInfo.HC.title)) {
      data.Home_Chef_Volunteeer_Agreement__c = true;
    }
    if (
      (data.Home_Chef_Food_Handler_Certification__c ||
        existingDocuments.foodHandler) &&
      (data.Home_Chef_Volunteeer_Agreement__c ||
        existingDocuments.volunteerAgreement)
    ) {
      data.Home_Chef_Status__c = 'Active';
    }
  }

  const accountUpdateUri =
    urls.SFOperationPrefix + accountURL + account.salesforceId;

  await fetcher.patch(accountUpdateUri, data);

  if (Object.values(existingDocuments).every((v) => !v)) {
    return;
  }

  // get all cdlinks tied to that account
  const CDLinkQuery = `SELECT Id, ContentDocumentId from ContentDocumentLink WHERE LinkedEntityId = '${account.salesforceId}'`;

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

  // add uppercase last name to home chef files because that's the naming scheme
  if (accountType === 'contact') {
    fileTitles = fileTitles.map(
      (title) => title + account.lastName?.toUpperCase()
    );
  }
  const DocsToDelete = ContentDocs.filter((cd) => {
    return fileTitles.includes(cd.Title);
  });
  // then delete those
  const deletePromises = DocsToDelete.map(async (cd) => {
    const ContentDocUri = urls.SFOperationPrefix + '/ContentDocument/' + cd.Id;
    await fetcher.delete(ContentDocUri);
  });
  await Promise.all(deletePromises);

  // links will be deleted automatically

  return;
};
