import getSecrets from '../utils/getSecrets';
import makeEnvelope from './createEnvelope';
import makeRecipientViewRequest from './createView';
import fetcher from '../utils/fetcher';
import { CreateEnvelopeArgs } from './createEnvelope';

interface UserInfo {
  name: string;
  email: string;
  id: string;
}

export interface EnvelopeArgs {
  dsReturnUrl: string;
  userInfo: UserInfo;
  doc: string;
}

export default async ({ dsReturnUrl, userInfo, doc }: EnvelopeArgs) => {
  const { DOCUSIGN_ACCOUNT_ID } = await getSecrets(['DOCUSIGN_ACCOUNT_ID']);

  const makeEnvelopeArgs: CreateEnvelopeArgs = {
    signerName: userInfo.name,
    signerEmail: userInfo.email,
    signerClientId: userInfo.id,
    doc,
  };

  // Make the envelope request body
  let envelope = makeEnvelope(makeEnvelopeArgs);

  // Call Envelopes::create API method
  await fetcher.setService('docusign');

  const res: { data: { envelopeId: string | undefined } } = await fetcher.post(
    `/v2/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes`,
    envelope
  );

  if (!res.data.envelopeId) {
    throw Error('Failed sending the envelope to Docusign');
  }

  const { envelopeId } = res.data;

  // Step 3. create the recipient view, the embedded signing
  let viewRequest = makeRecipientViewRequest({
    ...makeEnvelopeArgs,
    envelopeId,
    dsReturnUrl,
    doc,
  });

  // // Call the CreateRecipientView API
  const result: { data: { url: string | undefined } } = await fetcher.post(
    `/v2/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}/views/recipient`,
    viewRequest
  );

  if (!result.data.url) {
    throw Error('Failed creating the recipient view for Docusign');
  }

  return { redirectUrl: result.data.url };
};
