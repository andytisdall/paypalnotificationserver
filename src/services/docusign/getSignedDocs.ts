import fetcher from '../fetcher';
import getSecrets from '../getSecrets';
import urls from '../urls';

const getSignedDocs = async (envelopeId: string) => {
  await fetcher.setService('salesforce');
  const { DOCUSIGN_ACCOUNT_ID } = await getSecrets(['DOCUSIGN_ACCOUNT_ID']);
  if (!DOCUSIGN_ACCOUNT_ID) {
    throw Error('Docusign account ID not found');
  }
  const headers = {
    'Content-Type': 'application/pdf',
  };
  const docs = await fetcher.instance.get(
    `${urls.docusign}/v2/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}/documents/combined`,
    { headers, responseType: 'arraybuffer', responseEncoding: 'binary' }
  );
  return docs;
};

export default getSignedDocs;
