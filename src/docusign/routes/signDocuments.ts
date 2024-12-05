import express from 'express';

import { currentUser } from '../../middlewares/current-user';
import sendEnvelope, { EnvelopeArgs, UserInfo } from '../sendEnvelope';
import getSignedDocs from '../getSignedDocs';
import { FileWithType, DocType } from '../../files/salesforce/metadata';
import { uploadFiles } from '../../files/salesforce/uploadToSalesforce';
import urls from '../../utils/urls';
import {
  getAccountForFileUpload,
  Account,
} from '../../files/salesforce/getModel';
import {
  getContactById,
  getContactByEmail,
} from '../../utils/salesforce/SFQuery/contact';

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
    url: '/home-chef/onboarding/sign/success',
  },
  W9: {
    filename: 'W9',
    url: MEAL_PROGRAM_RETURN_URL,
  },
  DD: {
    filename: 'direct-deposit',
    url: MEAL_PROGRAM_RETURN_URL,
  },
  CKK: {
    filename: 'ck-kitchen-agreement',
    url: '/volunteers/sign/success',
  },
};

router.get('/sign/:doc/:id?', currentUser, async (req, res) => {
  const doc = req.params.doc as DocType;
  const id = req.params.id;

  let userInfo: UserInfo | undefined;

  if (req.currentUser) {
    const contact = await getContactById(req.currentUser.salesforceId);
    userInfo = {
      name: contact.Name!,
      email: contact.Email!,
      id: contact.Id!,
    };
  } else if (id) {
    const contact = await getContactById(id);
    if (!contact) {
      throw Error('Invalid Email Address');
    }
    userInfo = {
      name: contact.Name!,
      email: contact.Email!,
      id: contact.Id!,
    };
  }

  if (!userInfo) {
    throw Error('Contact Not Found');
  }

  if (!userInfo.email) {
    throw Error('Contact has no email, which is required for document signing');
  }

  const returnUrl = urls.client + accountConfig[doc].url;
  const envelopeArgs: EnvelopeArgs = {
    dsReturnUrl: returnUrl,
    userInfo,
    doc,
  };

  const { redirectUrl } = await sendEnvelope(envelopeArgs);

  res.send({ url: redirectUrl });
});

router.post('/getDoc', currentUser, async (req, res) => {
  const {
    envelopeId,
    doc,
    email,
  }: {
    envelopeId: string;
    doc: DocType;
    email?: string;
  } = req.body;

  const accountType = doc === 'HC' || doc === 'CKK' ? 'contact' : 'restaurant';

  let account: Account | undefined;
  if (req.currentUser) {
    account = await getAccountForFileUpload(accountType, req.currentUser);
  } else if (email) {
    const contact = await getContactByEmail(email);
    if (contact?.id) {
      account = await getAccountForFileUpload(accountType, {
        salesforceId: contact.id,
        id: '',
      });
    }
  }
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

  // const filesAdded = await uploadFiles(account, [file]);

  res.status(201);
  res.send({});
});

export default router;
