const docusign = require('docusign-esign');
const getSecrets = require('../getSecrets');
const axios = require('axios');

const makeEnvelope = require('./createEnvelope');
const makeRecipientViewRequest = require('./createView');

module.exports = async (args) => {
  let dsApiClient = new docusign.ApiClient({
    // oAuthBasePath: 'account-d.docusign.com',
    // basePath: 'demo.docusign.net/restapi',
  });
  dsApiClient.setOAuthBasePath('account-d.docusign.com');

  const { DOCUSIGN_ACCOUNT_ID, DOCUSIGN_ID, DOCUSIGN_SECRET } =
    await getSecrets(['DOCUSIGN_ACCOUNT_ID', 'DOCUSIGN_ID', 'DOCUSIGN_SECRET']);

  const token = await dsApiClient.generateAccessToken(
    DOCUSIGN_ID,
    DOCUSIGN_SECRET,
    args.authCode
  );
  // console.log(token.accessToken);
  dsApiClient.setBasePath('demo.docusign.net/restapi');
  // const userInfo = await dsApiClient.getUserInfo(token.accessToken);
  // dsApiClient.setBasePath(userInfo.accounts[0].baseUri + '/restapi');

  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + token.accessToken);
  // console.log(userInfo.accounts[0]);

  let envelopesApi = new docusign.EnvelopesApi(dsApiClient),
    results = null;

  // Make the envelope request body
  let envelope = makeEnvelope(args);

  // Call Envelopes::create API method
  // Exceptions will be caught by the calling function

  const res = await axios.post(
    `https://demo.docusign.net/restapi/v2/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes`,
    envelope,
    {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const { envelopeId } = res.data;
  // envelopesApi.createEnvelope(
  //   DOCUSIGN_ACCOUNT_ID,
  //   {
  //     envelopeDefinition: envelope,
  //   },
  //   async (err, data, response) => {
  //     // let envelopeId = results.envelopeId;
  //     // console.log(`Envelope was created. EnvelopeId ${envelopeId}`);
  //     if (err) {
  //       console.log(err);
  //     }
  //     console.log(data, response);
  // Step 3. create the recipient view, the embedded signing
  let viewRequest = makeRecipientViewRequest(args);
  // // Call the CreateRecipientView API
  // // Exceptions will be caught by the calling function
  // results = await envelopesApi.createRecipientView(
  //   DOCUSIGN_ACCOUNT_ID,
  //   res.data.envelopeId,
  //   {
  //     recipientViewRequest: viewRequest,
  //   }
  // );
  const result = await axios.post(
    `https://demo.docusign.net/restapi/v2/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}/views/recipient`,
    viewRequest,
    {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  // console.log(result);

  return result.data.url;
};
