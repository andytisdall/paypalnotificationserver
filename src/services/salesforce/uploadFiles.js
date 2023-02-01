const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

const urls = require('../urls');
const getSFToken = require('./getSFToken');

const axiosInstance = axios.create({
  baseURL: urls.salesforce,
});

const fileInfo = {
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
  HC: { title: 'Home Chef Contract', description: '', folder: 'home-chef' },
  FH: {
    title: 'Food Handler Certification',
    description: '',
    folder: 'home-chef',
  },
};

const uploadFiles = async (account, files) => {
  const insertPromises = files.map((f) => insertFile(account, f));
  await Promise.all(insertPromises);
};

const insertFile = async (account, file) => {
  const typeOfFile = fileInfo[file.docType];

  const fileMetaData = {
    Title: typeOfFile.title,
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

  let res = await axiosInstance.post(
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

  res = await axiosInstance.post(
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

const getDocumentId = async (CVId) => {
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

  const documentQueryResponse = await axiosInstance.get(documentQueryUri);
  return documentQueryResponse.data.records[0].ContentDocumentId;
};

const updateRestaurant = async (restaurantId, files, date) => {
  const token = await getSFToken();
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  const data = {};

  if (date) {
    data.Health_Department_Expiration_Date__c = date;
  }

  const fileTitles = files.map((f) => fileInfo[f.docType].title);

  const accountGetUri = urls.SFOperationPrefix + '/Account/' + restaurantId;
  const res = await axiosInstance.get(accountGetUri);

  const existingDocuments = res.data.Meal_Program_Onboarding__c;
  if (existingDocuments) {
    const docs = [...new Set([...existingDocuments.split(';'), ...fileTitles])];
    data.Meal_Program_Onboarding__c = docs.join(';') + ';';
  } else {
    data.Meal_Program_Onboarding__c = fileTitles.join(';') + ';';
  }

  const accountUpdateUri = urls.SFOperationPrefix + '/Account/' + restaurantId;

  await axiosInstance.patch(accountUpdateUri, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!existingDocuments) {
    return;
  }

  // get all cdlinks tied to that account
  const CDLinkQuery = `SELECT Id, ContentDocumentId from ContentDocumentLink WHERE LinkedEntityId = '${restaurantId}'`;

  const CDLinkQueryUri = urls.SFQueryPrefix + encodeURIComponent(CDLinkQuery);

  const CDLinkQueryResponse = await axiosInstance.get(CDLinkQueryUri);
  // then get all content documents from the CDIds in the cdlinks

  const getPromises = CDLinkQueryResponse.data.records.map(
    async ({ ContentDocumentId }) => {
      const ContentDocUri =
        urls.SFOperationPrefix + '/ContentDocument/' + ContentDocumentId;
      const { data } = await axiosInstance.get(ContentDocUri);
      // then search those for the titles that we're replacing
      return data;
    }
  );
  const ContentDocs = await Promise.all(getPromises);
  const DocsToDelete = ContentDocs.filter((cd) => {
    return fileTitles.includes(cd.Title);
  });
  // then delete those
  const deletePromises = DocsToDelete.map(async (cd) => {
    const ContentDocUri = urls.SFOperationPrefix + '/ContentDocument/' + cd.Id;
    await axiosInstance.delete(ContentDocUri);
  });
  await Promise.all(deletePromises);

  // and the links as well? or will it cascade

  return;
};

module.exports = { uploadFiles, updateRestaurant };
