const docusign = require('docusign-esign');
const getSecrets = require('../getSecrets');
const axios = require('axios');

const makeEnvelope = require('./createEnvelope');
const makeRecipientViewRequest = require('./createView');

module.exports = async (args) => {
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setOAuthBasePath('account-d.docusign.com');

  const { DOCUSIGN_ACCOUNT_ID, DOCUSIGN_ID, DOCUSIGN_SECRET } =
    await getSecrets(['DOCUSIGN_ACCOUNT_ID', 'DOCUSIGN_ID', 'DOCUSIGN_SECRET']);

  const token = await dsApiClient.generateAccessToken(
    DOCUSIGN_ID,
    DOCUSIGN_SECRET,
    args.authCode
  );

  // dsApiClient.setBasePath('demo.docusign.net/restapi');
  // const userInfo = await dsApiClient.getUserInfo(token.accessToken);
  // dsApiClient.setBasePath(userInfo.accounts[0].baseUri + '/restapi');

  // Make the envelope request body
  let envelope = makeEnvelope(args);

  // Call Envelopes::create API method
  const BASE_PATH = 'https://demo.docusign.net/restapi';
  const headers = {
    Authorization: `Bearer ${token.accessToken}`,
    'Content-Type': 'application/json',
  };

  const res = await axios.post(
    `${BASE_PATH}/v2/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes`,
    envelope,
    { headers }
  );

  const { envelopeId } = res.data;

  // Step 3. create the recipient view, the embedded signing
  let viewRequest = makeRecipientViewRequest({ ...args, envelopeId });

  // // Call the CreateRecipientView API
  const result = await axios.post(
    `${BASE_PATH}/v2/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}/views/recipient`,
    viewRequest,
    { headers }
  );

  return result.data.url;
};
