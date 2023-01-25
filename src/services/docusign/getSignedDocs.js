const axios = require('axios');

const getDSJWT = require('./getDSJWT.js');
const getSecrets = require('../getSecrets');
const urls = require('../urls');

const getSignedDocs = async (envelopeId) => {
  const token = await getDSJWT();
  const { DOCUSIGN_ACCOUNT_ID } = await getSecrets(['DOCUSIGN_ACCOUNT_ID']);

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/pdf',
  };
  const docs = await axios.get(
    `${urls.docusign}/v2/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}/documents/combined`,
    { headers, responseType: 'arraybuffer', responseEncoding: 'binary' }
  );
  return docs;
};

module.exports = getSignedDocs;
