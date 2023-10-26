import FormData from 'form-data';
import path from 'path';

import urls from '../../urls';
import fetcher from '../../fetcher';
import {
  Account,
  RestaurantAccount,
  ContactAccount,
} from '../../../files/salesforce/getModel';
import {
  fileInfo,
  FileWithType,
  FileMetaData,
  restaurantFileInfo,
} from '../../../files/salesforce/metadata';

export type AccountData = {
  Health_Department_Expiration_Date__c?: string;
  Meal_Program_Onboarding__c?: string;
  Meal_Program_Status__c?: string;
  Home_Chef_Food_Handler_Certification__c?: boolean;
  Home_Chef_Volunteeer_Agreement__c?: boolean;
  Home_Chef_Status__c?: string;
  CK_Kitchen_Volunteer_Status__c?: string;
  CK_Kitchen_Agreement__c?: boolean;
  Id?: string;
};

export const formatFilename = (file: FileMetaData, account: Account) => {
  const format = (string: string) => string.replace(/ /g, '_').toUpperCase();
  const accountName =
    account.type === 'contact' ? account.lastName : account.name;
  return format(file.title) + '_' + format(accountName);
};

export const insertFile = async (account: Account, file: FileWithType) => {
  const typeOfFile = fileInfo[file.docType];
  const title = formatFilename(typeOfFile, account);
  await uploadFileToSalesforce(
    { title, description: typeOfFile.description, folder: typeOfFile.folder },
    file.file,
    account.salesforceId
  );
};

export const uploadFileToSalesforce = async (
  { title, description, folder }: FileMetaData,
  file: { data: Buffer; name: string },
  id: string
) => {
  await fetcher.setService('salesforce');
  const fileMetaData = {
    Title: title,
    Description: description,
    PathOnClient: file.name + '/' + folder + path.extname(file.name),
  };

  const postBody = new FormData();
  postBody.append('entity_document', JSON.stringify(fileMetaData), {
    contentType: 'application/json',
  });

  postBody.append('VersionData', file.data, { filename: file.name });
  let contentVersionId;

  let res = await fetcher.post(
    urls.SFOperationPrefix + '/ContentVersion/',
    postBody,
    {
      headers: postBody.getHeaders(),
    }
  );
  contentVersionId = res.data.id;

  const ContentDocumentId = await getDocumentId(contentVersionId);

  const CDLinkData = {
    ShareType: 'I',
    LinkedEntityId: id,
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

export const deleteFiles = async (id: string, newFiles: string[]) => {
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
