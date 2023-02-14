import fetcher from '../services/fetcher';
import getSecrets from '../services/getSecrets';
import urls from '../services/urls';

const getSignedDocs = async (envelopeId: string) => {
  await fetcher.setService('salesforce');
  const { DOCUSIGN_ACCOUNT_ID } = await getSecrets(['DOCUSIGN_ACCOUNT_ID']);
  if (!DOCUSIGN_ACCOUNT_ID) {
    throw Error('Docusign account ID not found');
  }
  const headers = {
    'Content-Type': 'application/pdf',
  };

  await fetcher.setService('docusign');

  const docs = await fetcher.instance.get(
    `/v2/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}/documents/combined`,
    { headers, responseType: 'arraybuffer', responseEncoding: 'binary' }
  );
  return docs;
};

export default getSignedDocs;
