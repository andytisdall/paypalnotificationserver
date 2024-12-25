import express from 'express';

import { currentUser } from '../../middlewares/current-user';
import {
  getUnformattedContactByEmail,
  getContactById,
  UnformattedContact,
  getContactByEmail,
  addContact,
} from '../../utils/salesforce/SFQuery/contact';
import homeChefUpdate from '../../files/salesforce/homeChefUpdate';
import createSign from '../../utils/docMadeEasy/createSign';
import { uploadFiles } from '../../files/salesforce/uploadToSalesforce';
import downloadFile from '../../utils/docMadeEasy/downloadFile';
import { FileWithType } from '../../files/salesforce/metadata';

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
    url: '/volunteers/sign/success',
    template: 'C4mpEu6sQgFfrLmivzFNjGa8FywTRskFV',
    name: 'CK Kitchen Volunteer Agreement',
  },
};

router.post('/kitchen', async (req, res) => {
  const {
    firstName,
    lastName,
    email,
  }: { firstName: string; lastName: string; email: string } = req.body;

  let contact = await getContactByEmail(email);
  if (!contact) {
    contact = await addContact({
      Email: email,
      FirstName: firstName,
      LastName: lastName,
    });
  }

  if (contact.ckKitchenStatus === 'Active') {
    throw Error('Document has already been signed.');
  }

  const doc = { ...docInfo.CKK, url: '/forms/kitchen-agreement/success' };

  const signingUrl = await createSign({
    contact: { name: contact.name!, email: contact.email! },
    doc,
  });

  res.send({ signingUrl });
});

router.get('/:docType/:contactId?', currentUser, async (req, res) => {
  const { docType } = req.params as { docType: DocType };
  const { contactId } = req.params;

  let contact: UnformattedContact | undefined;

  if (!req.currentUser && !contactId) {
    throw Error('Request must have a user or pass info into the URL');
  }

  if (req.currentUser) {
    contact = await getContactById(req.currentUser.salesforceId);
  } else if (contactId) {
    contact = await getContactById(contactId);
    if (!contact) {
      throw Error('Invalid Email Address');
    }
  }

  if (!contact) {
    throw Error('Contact Not Found');
  }
  if (!contact.Email) {
    throw Error('Contact has no email, which is required for document signing');
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
    contact: { name: contact.Name!, email: contact.Email! },
    doc,
  });

  res.send({ signingUrl });
});

router.post('/update-contact', currentUser, async (req, res) => {
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
