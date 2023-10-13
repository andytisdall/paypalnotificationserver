import express from 'express';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import sendEnvelope, { EnvelopeArgs } from '../sendEnvelope';
import getSignedDocs from '../getSignedDocs';
import { FileWithType, DocType } from '../../files/salesforce/metadata';
import { uploadFiles } from '../../files/salesforce/uploadToSalesforce';
import urls from '../../utils/urls';
import { getAccountForFileUpload } from '../../files/salesforce/getModel';
import { getContactById } from '../../utils/salesforce/SFQuery/contact';

const router = express.Router();

type AccountInfo = {
  filename: string;
  url: string;
};

const MEAL_PROGRAM_RETURN_URL =
  '/meal-program/onboarding/sign-documents/success';

const accountConfig: Record<string, AccountInfo> = {
  RC: {
    filename: 'restaurant-contract',
    url: MEAL_PROGRAM_RETURN_URL,
  },
  HC: {
    filename: 'home-chef-agreement',
    url: '/home-chef/onboarding/docusign/success',
  },
  W9: {
    filename: 'W9',
    url: MEAL_PROGRAM_RETURN_URL,
  },
  DD: {
    filename: 'direct-deposit',
    url: MEAL_PROGRAM_RETURN_URL,
  },
};

router.get('/sign/:doc', currentUser, requireAuth, async (req, res) => {
  const doc = req.params.doc as DocType;

  const contact = await getContactById(req.currentUser!.salesforceId);

  if (!contact.Email) {
    throw Error('Contact has no email, which is required for document signing');
  }

  const userInfo = {
    name: contact.Name,
    email: contact.Email,
    id: contact.Id,
  };

  const returnUrl = urls.client + accountConfig[doc].url;
  const envelopeArgs: EnvelopeArgs = {
    dsReturnUrl: returnUrl,
    userInfo,
    doc,
  };

  const { redirectUrl } = await sendEnvelope(envelopeArgs);

  res.send({ url: redirectUrl });
});

router.post('/getDoc', currentUser, requireAuth, async (req, res) => {
  const {
    envelopeId,
    doc,
  }: {
    envelopeId: string;
    doc: DocType;
  } = req.body;

  const accountType = doc === 'HC' ? 'contact' : 'restaurant';

  const account = await getAccountForFileUpload(accountType, req.currentUser!);
  if (!account) {
    throw Error('Could not get account');
  }

  const docs = await getSignedDocs(envelopeId);
  const file: FileWithType = {
    docType: doc,
    file: {
      name: accountConfig[doc].filename + '.pdf',
      data: Buffer.from(docs.data),
    },
  };

  const filesAdded = await uploadFiles(account, [file]);

  res.status(201);
  res.send({ filesAdded });
});

export default router;
