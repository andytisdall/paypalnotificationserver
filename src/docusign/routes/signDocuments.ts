import express from 'express';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import sendEnvelope from '../sendEnvelope';
import getSignedDocs from '../getSignedDocs';
import {
  uploadFiles,
  File,
  DocType,
} from '../../files/uploadFilesToSalesforce';
import urls from '../../services/urls';
import { AccountType } from '../../files/getModel';
import { getContactById } from '../../services/salesforce/SFQuery';

const router = express.Router();

type AccountInfo = {
  name: string;
  url: string;
  docType: DocType;
};

const accountConfig: {
  restaurant: AccountInfo;
  contact: AccountInfo;
} = {
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

router.post('/sign', currentUser, requireAuth, async (req, res) => {
  const accountType: AccountType = req.body.accountType;
  if (!accountType || !['restaurant', 'contact'].includes(accountType)) {
    throw Error('Incorrect account type provided');
  }

  const contact = await getContactById(req.currentUser!.salesforceId);
  const userInfo = {
    name: contact.Name,
    email: contact.Email,
    id: contact.Id,
  };

  const returnUrl = urls.client + accountConfig[accountType].url + '/success';
  const envelopeArgs = {
    dsReturnUrl: returnUrl,
    accountType,
    userInfo,
  };

  const { redirectUrl } = await sendEnvelope(envelopeArgs);

  res.send(redirectUrl);
});

router.post('/getDoc', async (req, res) => {
  const {
    envelopeId,
    accountId,
    accountType,
  }: { envelopeId: string; accountId: string; accountType: AccountType } =
    req.body;

  const docs = await getSignedDocs(envelopeId);
  const file: File = {
    docType: accountConfig[accountType].docType,
    file: {
      name: accountConfig[accountType].name + '.pdf',
      data: Buffer.from(docs.data),
    },
  };

  const fileCount = await uploadFiles(accountId, [file], accountType);

  res.status(201);
  res.send({ filesAdded: fileCount });
});

export default router;
