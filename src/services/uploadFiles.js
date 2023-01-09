const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

const getSFToken = require('./getSFToken');

const axiosInstance = axios.create({
  baseURL: 'https://communitykitchens.my.salesforce.com/services',
});

const SF_API_PREFIX = '/data/v56.0';

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
  RC: { title: 'Contract', description: '', folder: 'contract' },
  W9: { title: 'W9', description: '', folder: 'w9' },
  DD: { title: 'Direct Deposit', description: '', folder: 'direct-deposit' },
};

const uploadFiles = async (restaurant, files, expiration) => {
  const token = await getSFToken();
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  const insertPromises = files.map((f) => insertFile(restaurant, f));
  const dataAdded = await Promise.all(insertPromises);

  if (expiration) {
    // do that
    dataAdded.push(true);
  }

  return dataAdded.length;
};

const insertFile = async (restaurant, file) => {
  const typeOfFile = fileInfo[file.docType];

  const fileMetaData = {
    Title: typeOfFile.title,
    Description: typeOfFile.description,
    PathOnClient:
      restaurant.name + '/' + typeOfFile.folder + path.extname(file.file.name),
  };

  const postBody = new FormData();
  postBody.append('entity_document', JSON.stringify(fileMetaData), {
    contentType: 'application/json',
  });

  postBody.append('VersionData', file.file.data, { filename: file.file.name });
  let contentVersionId;

  let res = await axiosInstance.post(
    SF_API_PREFIX + '/sobjects/ContentVersion/',
    postBody,
    {
      headers: postBody.getHeaders(),
    }
  );
  console.log('Content Version created: ' + res.data.id);
  contentVersionId = res.data.id;

  const ContentDocumentId = await getDocumentId(contentVersionId);
  const accountId = restaurant.salesforceId;

  const CDLinkData = {
    ShareType: 'I',
    LinkedEntityId: accountId,
    ContentDocumentId,
  };

  res = await axiosInstance.post(
    SF_API_PREFIX + '/sobjects/ContentDocumentLink/',
    CDLinkData,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  console.log('File Linked to Account: ' + res.data.id);
  return true;
};

const getDocumentId = async (CVId) => {
  const documentQuery = [
    '/query/?q=SELECT',
    'ContentDocumentId',
    'from',
    'ContentVersion',
    'WHERE',
    'Id',
    '=',
    `'${CVId}'`,
  ];

  const documentQueryUri = SF_API_PREFIX + documentQuery.join('+');

  const documentQueryResponse = await axiosInstance.get(documentQueryUri);
  return documentQueryResponse.data.records[0].ContentDocumentId;
};

const updateHealthExpiration = async (restaurantId, date) => {
  const data = {
    npsp__health__whatever: date,
  };

  const accountUpdateUri = SF_API_PREFIX + '/sobjects/Account/' + restaurantId;

  await axiosInstance.patch(accountUpdateUri, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  console.log('Health Permit Expiration Date Updated: ' + date);
};

module.exports = { uploadFiles };
