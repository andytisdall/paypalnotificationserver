const docusign = require('docusign-esign');

const getSecrets = require('../getSecrets');
const urls = require('../urls');

const getUserInfo = async (authCode) => {
  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setOAuthBasePath(urls.docusignOauth);
  dsApiClient.setBasePath(urls.docusign);

  const { DOCUSIGN_ID, DOCUSIGN_SECRET } = await getSecrets([
    'DOCUSIGN_ID',
    'DOCUSIGN_SECRET',
  ]);

  const { accessToken } = await dsApiClient.generateAccessToken(
    DOCUSIGN_ID,
    DOCUSIGN_SECRET,
    authCode
  );

  const userInfo = await dsApiClient.getUserInfo(accessToken);
  return { userInfo, token: accessToken };
};

module.exports = getUserInfo;
