const docusign = require('docusign-esign');
const getSecrets = require('../getSecrets');

let dsApiClient = new docusign.ApiClient();

module.exports = async (redirectUrl) => {
  const responseType = dsApiClient.OAuth.ResponseType.CODE; // Here we specify a response type of code, retrieving a single use auth code to be used to request a token
  const scopes = ['signature'];
  const { DOCUSIGN_ID } = await getSecrets(['DOCUSIGN_ID']);

  return dsApiClient.getAuthorizationUri(
    DOCUSIGN_ID,
    scopes,
    redirectUrl,
    responseType
  );
};
