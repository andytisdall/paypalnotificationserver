const express = require('express');
const axios = require('axios');

const { currentUser } = require('../middlewares/current-user.js');
const { requireAuth } = require('../middlewares/require-auth.js');
const sendEnvelope = require('../services/docusign/sendEnvelope');
const getDSAuthCode = require('../services/docusign/getDSAuthCode');
const { DOCUSIGN_ACCOUNT_ID } = require('../keys');
const uploadFiles = require('../services/uploadFiles')

const router = express.Router();

router.get('/docusign/login', currentUser, requireAuth, async (req, res) => {
  const authUri = getDSAuthCode();
  res.send(authUri);
});

router.post('/docusign/sign', currentUser, requireAuth, async (req, res) => {
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

router.post('/docusign/getDoc', async (req, res) => {
  const { envelopeId, restaurantId, token } = req.body;
  const BASE_PATH = 'https://demo.docusign.net/restapi';
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  const docs = await axios.get(
    `${BASE_PATH}/v2/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}/documents/combined`
  , { headers });
  
  const filesAdded = await uploadFiles(restaurantId, [{ docType: 'RC', file: docs}])
  res.send(filesAdded);

});

module.exports = router;
