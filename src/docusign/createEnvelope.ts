import { TemplateRole, EnvelopeDefinition } from 'docusign-esign';

const prodTemplates: Record<string, string> = {
  W9: '9fc27ab6-ceb6-471f-a7a4-bc875cd06942',
  RC: '44e64a6a-a0a1-4c5a-87de-bb62d5f28b1e',
  DD: 'ec16dfbd-9b80-4a0a-858f-ac5cb404df70',
  HC: '3c76d961-cce2-481b-a1ec-6b8377869622',
};

const devTemplates: Record<string, string> = {
  HC: '614f613e-bf2f-4dfc-8802-34e9ce4b5418',
  RC: '2a79af69-4b0d-400a-90d5-c2a760ecb29b',
  W9: '334537f2-683b-4fc5-9d39-f4083347fd01',
  DD: '131c6a3f-6b05-4ca5-bae3-b5fd1c2cfbea',
};

const templates =
  process.env.NODE_ENV === 'production' ? prodTemplates : devTemplates;

export interface CreateEnvelopeArgs {
  signerEmail: string;
  signerName: string;
  signerClientId: string;
  doc: string;
}

export default ({
  signerEmail,
  signerName,
  signerClientId,
  doc,
}: CreateEnvelopeArgs) => {
  // Create a signer recipient to sign the document, identified by name and email
  // We set the clientUserId to enable embedded signing for the recipient
  // We're setting the parameters via the object creation
  let signer: TemplateRole = {
    email: signerEmail,
    name: signerName,
    clientUserId: signerClientId,
    roleName: 'Signer',
  };

  // Add the recipient to the envelope object

  // Request that the envelope be sent by setting |status| to "sent".
  // To request that the envelope be created as a draft, set to "created"

  // create the envelope definition
  // The order in the docs array determines the order in the envelope
  let env: EnvelopeDefinition = {
    emailSubject: 'CK: Complete this Document',
    status: 'sent',
    templateId: templates[doc],
    templateRoles: [signer],
  };

  return env;
};
