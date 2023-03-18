import express from 'express';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import sendEnvelope, { EnvelopeArgs } from '../sendEnvelope';
import getSignedDocs from '../getSignedDocs';
import {
  uploadFiles,
  File,
  DocType,
} from '../../files/uploadFilesToSalesforce';
import urls from '../../utils/urls';
import { AccountType, getAccountForFileUpload } from '../../files/getModel';
import { getContactById } from '../../utils/salesforce/SFQuery';

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
    url: '/meal-program/docusign',
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

  if (!contact.Email) {
    throw Error('Contact has no email, which is required for document signing');
  }

  const userInfo = {
    name: contact.Name,
    email: contact.Email,
    id: contact.Id,
  };

  const returnUrl = urls.client + accountConfig[accountType].url + '/success';
  const envelopeArgs: EnvelopeArgs = {
    dsReturnUrl: returnUrl,
    accountType,
    userInfo,
  };

  const { redirectUrl } = await sendEnvelope(envelopeArgs);

  res.send(redirectUrl);
});

router.post('/getDoc', currentUser, requireAuth, async (req, res) => {
  const {
    envelopeId,
    accountId,
    accountType,
  }: { envelopeId: string; accountId: string; accountType: AccountType } =
    req.body;

  const account = await getAccountForFileUpload(accountType, accountId);
  if (!account) {
    throw Error('Could not get account');
  }
  if (account.type === 'contact' && account.volunteerAgreement) {
    throw Error('Volunteer Agreement has already been uploaded.');
  }
  if (account.type === 'restaurant' && account.onboarding) {
    throw Error('Restaurant Agreement has already been uploaded');
  }

  const docs = await getSignedDocs(envelopeId);
  const file: File = {
    docType: accountConfig[accountType].docType,
    file: {
      name: accountConfig[accountType].name + '.pdf',
      data: Buffer.from(docs.data),
    },
  };

  const filesAdded = await uploadFiles(account, [file]);

  res.status(201);
  res.send({ filesAdded });
});

export default router;
