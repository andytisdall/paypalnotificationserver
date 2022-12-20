const express = require('express');

const { currentUser } = require('../middlewares/current-user.js');
const { requireAuth } = require('../middlewares/require-auth.js');
const sendEnvelope = require('../services/docusign/sendEnvelope');
const getDSAuthCode = require('../services/docusign/getDSAuthCode');

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
    dsReturnUrl: 'http://localhost:3000/onboarding/documents',
    authCode,
  };

  const results = await sendEnvelope(envelopeArgs);
  res.send(results);
});

module.exports = router;
