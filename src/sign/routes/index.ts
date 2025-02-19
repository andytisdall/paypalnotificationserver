import express from 'express';

import { currentUser } from '../../middlewares/current-user';
import {
  getUnformattedContactByEmail,
  getContactById,
  UnformattedContact,
} from '../../utils/salesforce/SFQuery/contact';
import homeChefUpdate from '../../files/salesforce/homeChefUpdate';
import createSign from '../../utils/docMadeEasy/createSign';
import { uploadFiles } from '../../files/salesforce/uploadToSalesforce';
import downloadFile from '../../utils/docMadeEasy/downloadFile';
import { FileWithType } from '../../files/salesforce/metadata';
import getAccount from '../../utils/docMadeEasy/getAccount';
import { requireAuth } from '../../middlewares/require-auth';
import { sendEmail } from '../../utils/email';

const router = express.Router();

interface DocWebhookBody {
  eventType: string;
  envelope: {
    id: string;
    recipients: { email: string }[];
    docName: string;
  };
}

export interface UserInfo {
  name: string;
  email: string;
  id: string;
}

type DocType = 'HC' | 'CKK';

export interface DocInformation {
  url: string;
  template: string;
  type: DocType;
  name: string;
}

const docInfo: Record<DocType, DocInformation> = {
  HC: {
    type: 'HC',
    url: '/home-chef/onboarding/sign/success',
    template: 'C4mpEbExyMHD4S6z8WY4Wqsog1g79UZje',
    name: 'CK Home Chef Volunteer Agreement',
  },
  CKK: {
    type: 'CKK',
    url: '/volunteer-check-in/sign/success',
    template: 'C4mpEu6sQgFfrLmivzFNjGa8FywTRskFV',
    name: 'CK Kitchen Volunteer Agreement',
  },
};

router.get('/config', async (req, res) => {
  const account = await getAccount();

  const limitReached = account.apiSigns > 39;

  res.send({ limitReached });
});

router.get('/emailAgreement', currentUser, requireAuth, async (req, res) => {
  const contact = await getContactById(req.currentUser!.salesforceId);

  const emailText = `${contact.FirstName} ${contact.LastName} has requested a Home Chef volunteer agreement and the API limit has been reached for the month, so you have to email it to them. ID: ${contact.Id}`;

  await sendEmail({
    text: emailText,
    to: 'andy@ckoakland.org',
    from: 'andy@ckoakland.org',
    subject: 'Home Chef agreement requested',
  });

  res.send(200);
});

router.get(
  '/:docType?/:shiftId?/:contactId?',
  currentUser,
  async (req, res) => {
    const { docType, contactId, shiftId } = req.params as {
      docType?: DocType;
      contactId?: string;
      shiftId?: string;
    };

    let contact: UnformattedContact | undefined;

    if (!req.currentUser && !contactId) {
      throw Error('Request must have a user or pass info into the URL');
    }

    if (!docType || !docInfo[docType]) {
      throw Error('Invalid document requested');
    }

    if (contactId) {
      contact = await getContactById(contactId);
      if (!contact) {
        throw Error('Invalid Contact Id');
      }
    } else if (req.currentUser) {
      contact = await getContactById(req.currentUser.salesforceId);
    }

    if (!contact) {
      throw Error('Contact Not Found');
    }
    if (!contact.Email) {
      throw Error(
        'Contact has no email, which is required for document signing'
      );
    }

    const doc = docInfo[docType];

    // check if doc is signed and return early
    const homeChefAlreadySigned =
      contact.Home_Chef_Volunteeer_Agreement__c && docType === 'HC';
    const kitchenAlreadySigned =
      contact.CK_Kitchen_Agreement__c && docType === 'CKK';

    if (homeChefAlreadySigned || kitchenAlreadySigned) {
      return res.send({ signingUrl: '' });
    }

    const signingUrl = await createSign({
      contact: { name: contact.Name, email: contact.Email, id: contact.Id },
      doc,
      shiftId,
    });
    res.send({ signingUrl });
  }
);

router.post('/update-contact', async (req, res) => {
  const { envelope, eventType }: DocWebhookBody = req.body;

  if (eventType !== 'envelope_signed') {
    return res.sendStatus(200);
  }

  const contact = await getUnformattedContactByEmail(
    envelope.recipients[0].email
  );

  const doc = Object.values(docInfo).find((d) => d.name === envelope.docName);

  if (!contact) {
    throw Error('Could not get contact');
  }

  if (!doc) {
    throw Error();
  }

  const data = await downloadFile(envelope.id);

  const file: FileWithType = {
    docType: doc.type,
    file: {
      name: doc.name + '.pdf',
      data: Buffer.from(data),
    },
  };

  await uploadFiles(contact, [file]);
  await homeChefUpdate([doc.type], contact);

  res.sendStatus(200);
});

export default router;
