import getSecrets from '../services/getSecrets';
import makeEnvelope from './createEnvelope';
import makeRecipientViewRequest from './createView';
import urls from '../services/urls';
import fetcher from '../services/fetcher';

interface UserInfo {
  name: string;
  email: string;
  id: string;
}

interface EnvelopeArgs {
  dsReturnUrl: string;
  accountType: 'restaurant' | 'contact';
  userInfo: UserInfo;
}

export default async ({ dsReturnUrl, accountType, userInfo }: EnvelopeArgs) => {
  const { DOCUSIGN_ACCOUNT_ID } = await getSecrets(['DOCUSIGN_ACCOUNT_ID']);

  const makeEnvelopeArgs = {
    signerName: userInfo.name,
    signerEmail: userInfo.email,
    signerClientId: userInfo.id,
    accountType,
  };

  // Make the envelope request body
  let envelope = makeEnvelope(makeEnvelopeArgs);

  // Call Envelopes::create API method
  await fetcher.setService('docusign');

  const res = await fetcher.instance.post(
    `/v2/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes`,
    envelope
  );

  const { envelopeId } = res.data;

  // Step 3. create the recipient view, the embedded signing
  let viewRequest = makeRecipientViewRequest({
    ...makeEnvelopeArgs,
    envelopeId,
    dsReturnUrl,
  });

  // // Call the CreateRecipientView API
  const result = await fetcher.instance.post(
    `/v2/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}/views/recipient`,
    viewRequest
  );

  return { redirectUrl: result.data.url };
};
