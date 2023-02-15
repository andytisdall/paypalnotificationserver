import fs from 'fs-extra';
import path from 'path';
import {
  Tabs,
  SignHere,
  DateSigned,
  FullName,
  Recipients,
  EnvelopeDefinition,
  Document,
  Signer,
} from 'docusign-esign';

const mapAccountTypeToFiles = {
  restaurant: {
    file: 'World_Wide_Corp_lorem.pdf',
    name: 'Restaurant Contact',
    id: '1',
  },
  contact: {
    file: 'volunteer_agreement.pdf',
    name: 'Volunteer Agreement',
    id: '2',
  },
};

export interface CreateEnvelopeArgs {
  signerEmail: string;
  signerName: string;
  signerClientId: string;
  accountType: 'restaurant' | 'contact';
}

export default ({
  signerEmail,
  signerName,
  signerClientId,
  accountType,
}: CreateEnvelopeArgs) => {
  const doc = path.resolve(
    __dirname,
    'contracts/' + mapAccountTypeToFiles[accountType].file
  );

  // read file from a local directory
  // The read could raise an exception if the file is not available!
  const docPdfBytes = fs.readFileSync(doc);

  let doc1b64 = Buffer.from(docPdfBytes).toString('base64');
  // add the documents
  let doc1: Document = {
    documentBase64: doc1b64,
    name: mapAccountTypeToFiles[accountType].name, // can be different from actual file name
    fileExtension: 'pdf',
    documentId: mapAccountTypeToFiles[accountType].id,
  };

  // Create signHere fields (also known as tabs) on the documents,
  // We're using anchor (autoPlace) positioning
  //
  // The DocuSign platform seaches throughout your envelope's
  // documents for matching anchor strings.
  let signTab: SignHere = {
    anchorString: '/sn1/',
  };

  let dateTab: DateSigned = {
    anchorString: '/dt1/',
  };

  let nameTab: FullName = {
    anchorString: '/fn1/',
  };
  // Tabs are set per recipient / signer
  let signer1Tabs: Tabs = {
    signHereTabs: [signTab],
    dateSignedTabs: [dateTab],
    fullNameTabs: [nameTab],
  };
  // Create a signer recipient to sign the document, identified by name and email
  // We set the clientUserId to enable embedded signing for the recipient
  // We're setting the parameters via the object creation
  let signer1: Signer = {
    email: signerEmail,
    name: signerName,
    clientUserId: signerClientId,
    recipientId: '1',
    tabs: signer1Tabs,
  };

  // Add the recipient to the envelope object
  let recipients: Recipients = {
    signers: [signer1],
  };

  // Request that the envelope be sent by setting |status| to "sent".
  // To request that the envelope be created as a draft, set to "created"

  // create the envelope definition
  // The order in the docs array determines the order in the envelope
  let env: EnvelopeDefinition = {
    emailSubject: 'Sign the CK Home Chef Volunteer Agreement',
    documents: [doc1],
    status: 'sent',
    recipients,
  };

  return env;
};
