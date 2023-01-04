const express = require('express');
const axios = require('axios');

const { currentUser } = require('../middlewares/current-user.js');
const { requireAuth } = require('../middlewares/require-auth.js');
const sendEnvelope = require('../services/docusign/sendEnvelope');
const getDSAuthCode = require('../services/docusign/getDSAuthCode');
const getSecrets = require('../services/getSecrets');
const uploadFiles = require('../services/uploadFiles');
const { Restaurant } = require('../models/restaurant.js');

const router = express.Router();

const REDIRECT_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://coherent-vision-368820.uw.r.appspot.com/onboarding/docusign'
    : 'http://localhost:3000/onboarding/docusign';

router.get('/docusign/login', currentUser, requireAuth, async (req, res) => {
  const authUri = await getDSAuthCode(REDIRECT_URL + '/sign');
  res.send(authUri);
});

router.post('/docusign/sign', currentUser, requireAuth, async (req, res) => {
  const { authCode, restaurantId } = req.body;

  const envelopeArgs = {
    signerName: 'Andrew Tisdall',
    signerEmail: 'andy@ckoakland.org',
    signerClientId: '5',
    dsReturnUrl: REDIRECT_URL + '/success',
    authCode,
  };

  const { redirectUrl, token } = await sendEnvelope(envelopeArgs);

  const restaurant = await Restaurant.findById(restaurantId);
  restaurant.token = token;
  await restaurant.save();

  res.send(redirectUrl);
});

router.post('/docusign/getDoc', async (req, res) => {
  const { envelopeId, restaurantId } = req.body;

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  if (!restaurant.token) {
    throw new Error('Restaurant has no auth token saved');
  }

  const BASE_PATH = 'https://demo.docusign.net/restapi';
  const headers = {
    Authorization: `Bearer ${restaurant.token}`,
    'Content-Type': 'application/json',
  };

  const { DOCUSIGN_ACCOUNT_ID } = await getSecrets(['DOCUSIGN_ACCOUNT_ID']);
  const docs = await axios.get(
    `${BASE_PATH}/v2/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}/documents/combined`,
    { headers }
  );

  const filesAdded = await uploadFiles(restaurantId, [
    { docType: 'RC', file: docs },
  ]);

  restaurant.token = null;
  await restaurant.save();

  res.send(filesAdded);
});

module.exports = router;
