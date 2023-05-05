import fs from 'fs-extra';
import path from 'path';
import {
  Tabs,
  SignHere,
  DateSigned,
  FullName,
  Text,
  Recipients,
  EnvelopeDefinition,
  Document,
  Signer,
} from 'docusign-esign';

const mapDocNameToFiles: Record<string, Record<string, string>> = {
  restaurantContract: {
    file: 'World_Wide_Corp_lorem.pdf',
    name: 'Restaurant Contact',
    id: '1',
  },
  volunteerAgreement: {
    file: 'volunteer_agreement.pdf',
    name: 'Volunteer Agreement',
    id: '2',
  },
};

export interface CreateEnvelopeArgs {
  signerEmail: string;
  signerName: string;
  signerClientId: string;
  doc: string;
}

interface DocInfo {
  tabs: Tabs;
  emailSubject: string;
  document: Document;
}

const createDocument = (docName: string): DocInfo => {
  const fileName = path.resolve(__dirname, 'contracts', docName);
  // read file from a local directory
  // The read could raise an exception if the file is not available!
  let docPdfBytes: Buffer;
  try {
    docPdfBytes = fs.readFileSync(fileName);
  } catch {
    throw Error('Could not find contract on CK server');
  }

  // add the documents
  const doc: Document = {
    documentBase64: Buffer.from(docPdfBytes).toString('base64'),
    name: mapDocNameToFiles[docName].name, // can be different from actual file name
    fileExtension: 'pdf',
    documentId: mapDocNameToFiles[docName].id,
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

  let textTab: Text = {
    anchorString: '/txt1/',
  };

  // Tabs are set per recipient / signer
  let tabs: Tabs = {
    signHereTabs: [signTab],
    dateSignedTabs: [dateTab],
    fullNameTabs: [nameTab],
    textTabs: [textTab],
  };

  return {
    document: doc,
    emailSubject: mapDocNameToFiles[docName].subject,
    tabs,
  };
};

export default ({
  signerEmail,
  signerName,
  signerClientId,
  doc,
}: CreateEnvelopeArgs) => {
  const document = createDocument(doc);

  // change account type to doc name and find the doc that way
  // refactor tab creation into function that can output the different docs
  // also needs to output email subject
  // might as well merge that with mapAccountToFiles

  // Create a signer recipient to sign the document, identified by name and email
  // We set the clientUserId to enable embedded signing for the recipient
  // We're setting the parameters via the object creation
  let signer: Signer = {
    email: signerEmail,
    name: signerName,
    clientUserId: signerClientId,
    recipientId: '1',
    tabs: document.tabs,
  };

  // Add the recipient to the envelope object
  let recipients: Recipients = {
    signers: [signer],
  };

  // Request that the envelope be sent by setting |status| to "sent".
  // To request that the envelope be created as a draft, set to "created"

  // create the envelope definition
  // The order in the docs array determines the order in the envelope
  let env: EnvelopeDefinition = {
    emailSubject: document.emailSubject,
    documents: [document.document],
    status: 'sent',
    recipients,
  };

  return env;
};
