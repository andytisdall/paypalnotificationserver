const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const getSecrets = require('../services/getSecrets');

const axiosInstance = axios.create({
  baseURL: 'https://communitykitchens.my.salesforce.com/services',
});

const SF_API_PREFIX = '/data/v56.0';

const insertFile = async () => {
  const secrets = await getSecrets(['SF_CLIENT_ID', 'SF_CLIENT_SECRET']);
  const tokenResult = await getToken(secrets);
  if (!tokenResult.success) {
    return console.log(
      'Attempt to get Salesforce token failed: ' + JSON.stringify(tokenResult)
    );
  }

    const fileMetaData = {
        Title: 'Test File',
        Description: 'See if this works',
        PathOnClient: 'testfile.jpg'
    }

    const postBody = new FormData();
    postBody.append('entity_document', JSON.stringify(fileMetaData), {contentType: 'application/json' })
    postBody.append('VersionData', fs.createReadStream('./logo.jpeg'))

    try {
        const res = await axiosInstance.post(SF_API_PREFIX + '/sobjects/ContentVersion/', postBody, {
            headers: postBody.getHeaders()
        });
        console.log('Content Version created: ' + res.data);
    } catch (err) {
        return console.log(err.response.data);
    } 

    const ContentDocumentId = await getDocumentId();
    const accountId = '0018Z00002lLsLWQA0';

    const CDLinkData = {
        ShareType: 'I',
        LinkedEntityId: accountId,
        ContentDocumentId
    }

    try {
        const res = await axiosInstance.post(SF_API_PREFIX + '/sobjects/ContentDocumentLink/', CDLinkData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
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
  return { success: true }
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
        `'0688Z00000VBW3gQAH'`
      ];
    
    const documentQueryUri = SF_API_PREFIX + documentQuery.join('+');

    try {
        const documentQueryResponse = await axiosInstance.get(documentQueryUri);
        return documentQueryResponse.data.records[0].ContentDocumentId;
    } catch (err) {
        console.log(err.response.data);
    }
};
