import axios from 'axios';

import getSecrets from '../getSecrets';
import urls from '../urls';

const downloadFile = async (envelopeId: string) => {
  const { DOCMADEEASY_KEY } = await getSecrets(['DOCMADEEASY_KEY']);

  if (!DOCMADEEASY_KEY) {
    throw Error('Failed to get docs key');
  }

  // get pdf file
  const pdfRequestUrl =
    urls.docMadeEasy +
    '/envelope/download/' +
    envelopeId +
    '?type=s&akey=' +
    DOCMADEEASY_KEY;

  const { data } = await axios.get(pdfRequestUrl, {
    headers: {
      'Content-Type': 'application/pdf',
    },
    responseType: 'arraybuffer',
    responseEncoding: 'binary',
  });

  return data;
};

export default downloadFile;
