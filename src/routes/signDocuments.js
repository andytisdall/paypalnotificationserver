const express = require('express');
const axios = require('axios');

const { currentUser } = require('../middlewares/current-user.js');
const { requireAuth } = require('../middlewares/require-auth.js');
const sendEnvelope = require('../services/docusign/sendEnvelope');
const getDSAuthCode = require('../services/docusign/getDSAuthCode');
const getSecrets = require('../services/getSecrets');
const { uploadFiles } = require('../services/uploadFiles');
const { getAccountForFileUpload } = require('../services/getModel');
const getDSJWT = require('../services/docusign/getDSJWT.js');
const urls = require('../services/urls');

const router = express.Router();

const URL_EXT = {
  restaurant: 'onboarding/docusign',
  contact: 'home-chef/onboarding/docusign',
};

const mapDocumentToConfig = {
  RC: { name: 'restaurant-contract' },
  HC: { name: 'home-chef-agreement' },
};

router.get(
  '/docusign/login/:accountType',
  currentUser,
  requireAuth,
  async (req, res) => {
    const { accountType } = req.params;

    const returnUrl = urls.self + URL_EXT[accountType] + '/sign';

    const authUri = await getDSAuthCode(returnUrl);
    res.send(authUri);
  }
);

router.post('/docusign/sign', currentUser, requireAuth, async (req, res) => {
  const { authCode, accountType, docCode } = req.body;

  const returnUrl = urls.self + URL_EXT[accountType] + '/success';

  const envelopeArgs = {
    signerName: 'Andrew Tisdall',
    signerEmail: 'andy@ckoakland.org',
    signerClientId: '5',
    dsReturnUrl: returnUrl,
    authCode,
    docCode,
  };

  const { redirectUrl } = await sendEnvelope(envelopeArgs);

  res.send(redirectUrl);
});

router.post('/docusign/getDoc', async (req, res) => {
  const { envelopeId, accountId, accountType, docCode } = req.body;

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

  const file = {
    docType: docCode,
    file: {
      name: mapDocumentToConfig[docCode].name + '.pdf',
      data: Buffer.from(docs.data),
    },
  };

  const account = await getAccountForFileUpload(accountType, accountId);

  const filesAdded = await uploadFiles(account, [file]);
  res.send({ filesAdded });
});

module.exports = router;
