const express = require('express');

const { currentUser } = require('../middlewares/current-user.js');
const { requireAuth } = require('../middlewares/require-auth.js');
const sendEnvelope = require('../services/docusign/sendEnvelope');
const getDSAuthCode = require('../services/docusign/getDSAuthCode');
const getSignedDocs = require('../services/docusign/getSignedDocs');
const { uploadFiles } = require('../services/salesforce/uploadFiles');
const { getAccountForFileUpload } = require('../services/getModel');
const urls = require('../services/urls');

const router = express.Router();

const accountConfig = {
  restaurant: {
    name: 'restaurant-contract',
    url: '/onboarding/docusign',
    docType: 'RC',
  },
  contact: {
    name: 'home-chef-agreement',
    url: '/home-chef/onboarding/docusign',
    docType: 'HC',
  },
};

router.get(
  '/docusign/login/:accountType',
  currentUser,
  requireAuth,
  async (req, res) => {
    const { accountType } = req.params;

    const returnUrl = urls.self + accountConfig[accountType].url + '/sign';
    const authUri = await getDSAuthCode(returnUrl);

    res.send(authUri);
  }
);

router.post('/docusign/sign', currentUser, requireAuth, async (req, res) => {
  const { authCode, accountType } = req.body;

  const returnUrl = urls.self + accountConfig[accountType].url + '/success';
  const envelopeArgs = {
    dsReturnUrl: returnUrl,
    authCode,
    accountType,
  };

  const { redirectUrl } = await sendEnvelope(envelopeArgs);

  res.send(redirectUrl);
});

router.post('/docusign/getDoc', async (req, res) => {
  const { envelopeId, accountId, accountType } = req.body;

  const docs = await getSignedDocs(envelopeId);
  const file = {
    docType: accountConfig[accountType].docType,
    file: {
      name: accountConfig[accountType].name + '.pdf',
      data: Buffer.from(docs.data),
    },
  };

  const account = await getAccountForFileUpload(accountType, accountId);
  const filesAdded = await uploadFiles(account, [file]);

  res.send({ filesAdded });
});

module.exports = router;
