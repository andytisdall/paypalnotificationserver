import { DocInformation } from '../../sign/routes';
import fetcher from '../fetcher';
import urls from '../urls';

const createAgreement = async ({
  contact,
  doc,
}: {
  contact: { name: string; email: string };
  doc: DocInformation;
}) => {
  await fetcher.setService('acrobat');

  const returnUrl =
    urls.client + doc.url + '/' + doc.type + '/' + contact.email;

  const { data } = await fetcher.post(urls.acrobat + '/agreements', {
    type: 'AGREEMENT',
    state: 'IN_PROCESS',
    name: doc.name,
    signatureType: 'ESIGN',
    participantSetsInfo: [
      {
        role: 'SIGNER',
        memberInfos: [
          {
            name: contact.name,
            email: contact.email,
          },
        ],
        order: 1,
      },
    ],
    fileInfos: [{ libraryDocumentId: doc.template }],
    postSignOption: {
      redirectUrl: returnUrl,
    },
  });

  const agreementId: string = data.id;

  if (!agreementId) {
    throw Error('Agreement creation failed');
  }

  return agreementId;
};

export default createAgreement;
