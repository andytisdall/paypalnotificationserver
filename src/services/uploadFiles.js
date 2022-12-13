const axios = require('axios');
const FormData = require('form-data');
const { Readable } = require('stream');

const getSecrets = require('./getSecrets');

const axiosInstance = axios.create({
  baseURL: 'https://communitykitchens.my.salesforce.com/services',
});

const SF_API_PREFIX = '/data/v56.0';

const fileInfo = {
  BL: { title: 'Business License', description: '', path: 'business-license' },
  HD: {
    title: 'Health Department Permit',
    description: '',
    path: 'health-department-permit',
  },
  RC: { title: 'Contract', description: '', path: 'contract' },
  W9: { title: 'W9', description: '', path: 'w9' },
  DD: { title: 'Direct Deposit', description: '', path: 'direct-deposit' },
};

const uploadFiles = async (restaurant, files) => {
  const secrets = await getSecrets(['SF_CLIENT_ID', 'SF_CLIENT_SECRET']);
  const tokenResult = await getToken(secrets);
  if (!tokenResult.success) {
    return console.log(
      'Attempt to get Salesforce token failed: ' + JSON.stringify(tokenResult)
    );
  }

  files.forEach((f) => insertFile(restaurant, f));
};

const insertFile = async (restaurant, file) => {
  const typeOfFile = fileInfo[file.name];

  const fileMetaData = {
    Title: typeOfFile.title,
    Description: typeOfFile.description,
    PathOnClient: restaurant.name + '/' + typeOfFile.path,
  };

  const postBody = new FormData();
  postBody.append('entity_document', JSON.stringify(fileMetaData), {
    contentType: 'application/json',
  });

  // return console.log(file.data);

  // const readableStream = new Readable();
  // readableStream.push(file.data);
  // readableStream.push(null);

  postBody.append('VersionData', file.data);

  try {
    const res = await axiosInstance.post(
      SF_API_PREFIX + '/sobjects/ContentVersion/',
      postBody,
      {
        headers: postBody.getHeaders(),
      }
    );
    console.log('Content Version created: ' + res.data);
  } catch (err) {
    console.log(err.config.data);
    return console.log(err.response?.data || err);
  }

  const ContentDocumentId = await getDocumentId();
  const accountId = restaurant.id;

  const CDLinkData = {
    ShareType: 'I',
    LinkedEntityId: accountId,
    ContentDocumentId,
  };

  try {
    const res = await axiosInstance.post(
      SF_API_PREFIX + '/sobjects/ContentDocumentLink/',
      CDLinkData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('File Linked to Account: ' + res.data);
  } catch (err) {
    console.log(err.response.data);
  }
};

const getToken = async (secrets) => {
  const SALESFORCE_AUTH_CREDENTIALS = {
    client_id: secrets.SF_CLIENT_ID,
    client_secret: secrets.SF_CLIENT_SECRET,
    grant_type: 'client_credentials',
  };

  const SFAuthPost = new URLSearchParams();
  for (field in SALESFORCE_AUTH_CREDENTIALS) {
    SFAuthPost.append(field, SALESFORCE_AUTH_CREDENTIALS[field]);
  }

  let token;
  const SF_AUTH_URI = '/oauth2/token';
  try {
    const SFResponse = await axiosInstance.post(SF_AUTH_URI, SFAuthPost, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    token = SFResponse.data.access_token;
  } catch (err) {
    return err.response.data;
  }

  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  return { success: true };
};

const getDocumentId = async () => {
  const documentQuery = [
    '/query/?q=SELECT',
    'ContentDocumentId',
    'from',
    'ContentVersion',
    'WHERE',
    'Id',
    '=',
    `'0688Z00000VBW3gQAH'`,
  ];

  const documentQueryUri = SF_API_PREFIX + documentQuery.join('+');

  try {
    const documentQueryResponse = await axiosInstance.get(documentQueryUri);
    return documentQueryResponse.data.records[0].ContentDocumentId;
  } catch (err) {
    console.log(err.response.data);
  }
};

module.exports = { uploadFiles };
