const express = require('express');
const axios = require('axios');

const { currentUser } = require('../middlewares/current-user.js');
const { requireAuth } = require('../middlewares/require-auth.js');
const sendEnvelope = require('../services/docusign/sendEnvelope');
const getDSAuthCode = require('../services/docusign/getDSAuthCode');
const { DOCUSIGN_ACCOUNT_ID } = require('../keys');

const router = express.Router();

router.get('/docusign/login', async (req, res) => {
  const authUri = getDSAuthCode();
  res.send(authUri);
});

router.post('/docusign/sign', async (req, res) => {
  const { authCode } = req.body;

  const envelopeArgs = {
    signerName: 'Andrew Tisdall',
    signerEmail: 'andy@ckoakland.org',
    signerClientId: '5',
    dsReturnUrl: 'http://localhost:3000/onboarding/docusign/success',
    authCode,
  };

  const results = await sendEnvelope(envelopeArgs);
  res.send(results);
});

router.get('/docusign/getDoc/:envelopeId', async (req, res) => {
  const { envelopeId } = req.params;
  const BASE_PATH = 'https://demo.docusign.net/restapi';
  const docs = axios.get(
    `${BASE_PATH}/v2/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}/documents/combined`
  );
  res.send(docs);
});

module.exports = router;
