const axios = require('axios');

const getSecrets = require('../getSecrets');
const makeEnvelope = require('./createEnvelope');
const makeRecipientViewRequest = require('./createView');
const getUserInfo = require('./getUserInfo');

module.exports = async ({ dsReturnUrl, accountType, authCode }) => {
  const { DOCUSIGN_ACCOUNT_ID } = await getSecrets(['DOCUSIGN_ACCOUNT_ID']);
  const { userInfo, token } = await getUserInfo(authCode);

  const makeEnvelopeArgs = {
    signerName: userInfo.name,
    signerEmail: userInfo.email,
    signerClientId: Math.floor(Math.random() * 10000),
    accountType,
  };

  // Make the envelope request body
  let envelope = makeEnvelope(makeEnvelopeArgs);

  // Call Envelopes::create API method
  const BASE_PATH = userInfo.accounts[0].baseUri;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const res = await axios.post(
    `${BASE_PATH}/restapi/v2/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes`,
    envelope,
    { headers }
  );

  const { envelopeId } = res.data;

  // Step 3. create the recipient view, the embedded signing
  let viewRequest = makeRecipientViewRequest({
    ...makeEnvelopeArgs,
    envelopeId,
    dsReturnUrl,
  });

  // // Call the CreateRecipientView API
  const result = await axios.post(
    `${BASE_PATH}/restapi/v2/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}/views/recipient`,
    viewRequest,
    { headers }
  );

  return { redirectUrl: result.data.url };
};
