import axios from 'axios';

import urls from '../urls';
import { DocInformation } from '../../sign/routes';
import getSecrets from '../getSecrets';

const createSign = async ({
  contact,
  doc,
}: {
  contact: {
    name: string;
    id: string;
    email: string;
  };
  doc: DocInformation;
}): Promise<string> => {
  const { DOCMADEEASY_KEY } = await getSecrets(['DOCMADEEASY_KEY']);

  const redirectUrl = urls.client + doc.url + '/' + contact.id;

  const templateId = doc.template;

  const signRequestBody = {
    recipients: [
      {
        name: contact.name,
        email: contact.email,
        order: '1',
        select: '1',
      },
    ],
    redirectUrl,
    testMode: process.env.NODE_ENV !== 'production',
    allowReassign: true,
    allowDecline: true,
    linkExpire: '30',
    message:
      'Hello {{recipient_name}},\n\n{{sender_name}} has sent you a new document to view and sign. Please click on the link to begin signing.',
    subject: 'Please sign this document',
  };

  const requestUrl =
    urls.docMadeEasy +
    '/envelope/create/' +
    templateId +
    '?akey=' +
    DOCMADEEASY_KEY;

  const result = await axios.post(requestUrl, signRequestBody);

  if (!result.data.success) {
    throw Error('Could not create agreement');
  }

  return result.data.recipients[0].url;
};

export default createSign;
