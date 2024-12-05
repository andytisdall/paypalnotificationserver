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
    email: string;
  };
  doc: DocInformation;
}): Promise<string> => {
  const { DOCMADEEASY_KEY } = await getSecrets(['DOCMADEEASY_KEY']);

  // docmadeeasy.auth(DOCMADEEASY_KEY);

  const redirectUrl = urls.client + doc.url + '/' + contact.email;

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
    testMode: true,
    allowReassign: true,
    allowDecline: true,
    deliverEmail: true,
    linkExpire: '30',
    message:
      'Hello {{recipient_name}},\n\n{{sender_name}} has sent you a new document to view and sign. Please click on the link to begin signing.',
    subject: 'Please sign the document.',
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

  // const redirectUrl =
  //   urls.client +
  //   doc.url +
  //   '/' +
  //   doc.type +
  //   '/' +
  //   contact.email +
  //   '/' +
  //   envelopeId;

  // const linkUrl =
  //   urls.docMadeEasy +
  //   '/envelope/link/' +
  //   envelopeId +
  //   '?akey=' +
  //   DOCMADEEASY_KEY;

  // const linkRequestBody = { linkExpire: '30' };

  // const { data } = await axios.post(linkUrl, linkRequestBody);

  // if (!data.recipients) {
  //   throw Error('Could not get signing URL');
  // }

  // return data.recipients[0].url;
};

export default createSign;
