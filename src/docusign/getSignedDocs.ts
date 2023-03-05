import fetcher from '../utils/fetcher';
import getSecrets from '../utils/getSecrets';

const getSignedDocs = async (envelopeId: string) => {
  await fetcher.setService('docusign');
  const { DOCUSIGN_ACCOUNT_ID } = await getSecrets(['DOCUSIGN_ACCOUNT_ID']);
  if (!DOCUSIGN_ACCOUNT_ID) {
    throw Error('Docusign account ID not found');
  }
  const headers = {
    'Content-Type': 'application/pdf',
  };

  await fetcher.setService('docusign');

  const docs = await fetcher.get(
    `/v2/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}/documents/combined`,
    { headers, responseType: 'arraybuffer', responseEncoding: 'binary' }
  );
  return docs;
};

export default getSignedDocs;
