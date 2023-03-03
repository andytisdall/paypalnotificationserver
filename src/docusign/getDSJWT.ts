import docusign from 'docusign-esign';
import getSecrets from '../services/getSecrets';
import urls from '../services/urls';

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
  let result: { body: { access_token: string | undefined } } | undefined;
  try {
    result = await dsApiClient.requestJWTUserToken(
      DOCUSIGN_ID,
      DOCUSIGN_USER_ID,
      ['signature', 'impersonation'],
      DPKBuffer,
      10000
    );
  } catch (err) {
    throw Error('This is where the error happened');
  }

  if (!result?.body.access_token) {
    throw Error('Could not get Docusign token');
  }

  return result.body.access_token;
};
