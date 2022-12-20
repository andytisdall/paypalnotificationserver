const docusign = require('docusign-esign');

let dsApiClient = new docusign.ApiClient();
const { DOCUSIGN_ID, DOCUSIGN_SECRET } = require('../../keys');

module.exports = () => {
  const responseType = dsApiClient.OAuth.ResponseType.CODE; // Here we specify a response type of code, retrieving a single use auth code to be used to request a token
  const scopes = ['signature'];
  // const scopes = [dsApiClient.OAuth.Scope.EXTENDED];
  const redirectUrl = 'http://localhost:3000/onboarding/docusign/sign';

  return dsApiClient.getAuthorizationUri(
    DOCUSIGN_ID,
    scopes,
    redirectUrl,
    responseType
  );
};
