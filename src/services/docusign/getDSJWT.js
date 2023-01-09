const docusign = require('docusign-esign');
const getSecrets = require('../getSecrets');

let dsApiClient = new docusign.ApiClient();

module.exports = async () => {
  const { DOCUSIGN_ID, DOCUSIGN_USER_ID, DOCUSIGN_PRIVATE_KEY } =
    await getSecrets([
      'DOCUSIGN_ID',
      'DOCUSIGN_USER_ID',
      'DOCUSIGN_PRIVATE_KEY',
    ]);

  dsApiClient.setBasePath('https://demo.docusign.net/restapi');

  const result = await dsApiClient.requestJWTUserToken(
    DOCUSIGN_ID,
    DOCUSIGN_USER_ID,
    ['signature', 'impersonation'],
    DOCUSIGN_PRIVATE_KEY,
    10000
  );

  return result.body.access_token;

  // return data.access_token;
};
