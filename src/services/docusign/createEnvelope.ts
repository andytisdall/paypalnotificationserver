import fs from 'fs-extra';
import path from 'path';

const mapAccountTypeToFiles = {
  restaurant: 'World_Wide_Corp_lorem.pdf',
  contact: 'Joshi.pdf',
};

interface CreateEnvelopeArgs {
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
    'contracts/' + mapAccountTypeToFiles[accountType]
  );

  // read file from a local directory
  // The read could raise an exception if the file is not available!
  const docPdfBytes = fs.readFileSync(doc);

  let doc1b64 = Buffer.from(docPdfBytes).toString('base64');
  // add the documents
  let doc1 = {
    documentBase64: doc1b64,
    name: 'TestPDF', // can be different from actual file name
    fileExtension: 'pdf',
    documentId: '3',
  };

  // Create signHere fields (also known as tabs) on the documents,
  // We're using anchor (autoPlace) positioning
  //
  // The DocuSign platform seaches throughout your envelope's
  // documents for matching anchor strings.
  let signHere1 = {
    anchorString: '/sn1/',
    anchorYOffset: '10',
    anchorUnits: 'pixels',
    anchorXOffset: '20',
  };
  // Tabs are set per recipient / signer
  let signer1Tabs = {
    signHereTabs: [signHere1],
  };
  // Create a signer recipient to sign the document, identified by name and email
  // We set the clientUserId to enable embedded signing for the recipient
  // We're setting the parameters via the object creation
  let signer1 = {
    email: signerEmail,
    name: signerName,
    clientUserId: signerClientId,
    recipientId: '1',
    tabs: signer1Tabs,
  };

  // Add the recipient to the envelope object
  let recipients = {
    signers: [signer1],
  };

  // Request that the envelope be sent by setting |status| to "sent".
  // To request that the envelope be created as a draft, set to "created"

  // create the envelope definition
  // The order in the docs array determines the order in the envelope
  let env = {
    emailSubject: 'Please sign this document',
    documents: [doc1],
    status: 'sent',
    recipients,
  };

  return env;
};
