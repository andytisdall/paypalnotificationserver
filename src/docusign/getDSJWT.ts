import docusign from 'docusign-esign';
import getSecrets from '../utils/getSecrets';
import urls from '../utils/urls';

let dsApiClient = new docusign.ApiClient();

export default async () => {
  const { DOCUSIGN_ID, DOCUSIGN_USER_ID, DOCUSIGN_PRIVATE_KEY } =
    await getSecrets([
      'DOCUSIGN_ID',
      'DOCUSIGN_USER_ID',
      'DOCUSIGN_PRIVATE_KEY',
    ]);

  if (!DOCUSIGN_ID) {
    throw Error('Docusign integration key not found');
  }
  if (!DOCUSIGN_USER_ID) {
    throw Error('Docusign User ID not found');
  }
  if (!DOCUSIGN_PRIVATE_KEY) {
    throw Error('Docusign private RSA key not found');
  }

  const DPKBuffer = Buffer.from(DOCUSIGN_PRIVATE_KEY);

  dsApiClient.setBasePath(urls.docusign);

  const result: { body: { access_token: string | undefined } } | undefined =
    await dsApiClient.requestJWTUserToken(
      DOCUSIGN_ID,
      DOCUSIGN_USER_ID,
      ['signature', 'impersonation'],
      DPKBuffer,
      10000
    );

  if (!result?.body.access_token) {
    throw Error('Could not get Docusign token');
  }

  return result.body.access_token;
};
