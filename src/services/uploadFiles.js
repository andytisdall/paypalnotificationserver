const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

const getSecrets = require('./getSecrets');

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
  const secrets = await getSecrets(['SF_CLIENT_ID', 'SF_CLIENT_SECRET']);
  const tokenResult = await getToken(secrets);
  if (!tokenResult.success) {
    return console.log(
      'Attempt to get Salesforce token failed: ' + JSON.stringify(tokenResult)
    );
  }

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
  try {
    const res = await axiosInstance.post(
      SF_API_PREFIX + '/sobjects/ContentVersion/',
      postBody,
      {
        headers: postBody.getHeaders(),
      }
    );
    console.log('Content Version created: ' + res.data.id);
    contentVersionId = res.data.id;
  } catch (err) {
    console.log(err.config.data);
    return console.log(err.response?.data || err);
  }

  const ContentDocumentId = await getDocumentId(contentVersionId);
  // const accountId = restaurant.id;
  const accountId = '0018Z00002lLOx1QAG';

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
    console.log('File Linked to Account: ' + res.data.id);
    return true;
  } catch (err) {
    console.log(err.response.data);
  }
  // };

  // });
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

  try {
    const documentQueryResponse = await axiosInstance.get(documentQueryUri);
    return documentQueryResponse.data.records[0].ContentDocumentId;
  } catch (err) {
    console.log(err.response?.data || err);
  }
};

module.exports = { uploadFiles };
