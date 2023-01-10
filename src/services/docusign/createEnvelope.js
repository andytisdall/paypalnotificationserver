const docusign = require('docusign-esign');
const fs = require('fs-extra');
const path = require('path');

const mapDocCodeToFile = {
  RC: 'World_Wide_Corp_lorem.pdf',
  HC: 'Joshi.pdf',
};

module.exports = ({ signerEmail, signerName, signerClientId, docCode }) => {
  const doc = path.resolve(__dirname, 'contracts/' + mapDocCodeToFile[docCode]);

  // read file from a local directory
  // The read could raise an exception if the file is not available!
  const docPdfBytes = fs.readFileSync(doc);

  // create the envelope definition
  let env = new docusign.EnvelopeDefinition();
  env.emailSubject = 'Please sign this document';

  // add the documents
  let doc1 = new docusign.Document(),
    doc1b64 = Buffer.from(docPdfBytes).toString('base64');
  doc1.documentBase64 = doc1b64;
  doc1.name = 'TestPDF'; // can be different from actual file name
  doc1.fileExtension = 'pdf';
  doc1.documentId = '3';

  // The order in the docs array determines the order in the envelope
  env.documents = [doc1];

  // Create a signer recipient to sign the document, identified by name and email
  // We set the clientUserId to enable embedded signing for the recipient
  // We're setting the parameters via the object creation
  let signer1 = docusign.Signer.constructFromObject({
    email: signerEmail,
    name: signerName,
    clientUserId: signerClientId,
    recipientId: 1,
  });

  // Create signHere fields (also known as tabs) on the documents,
  // We're using anchor (autoPlace) positioning
  //
  // The DocuSign platform seaches throughout your envelope's
  // documents for matching anchor strings.
  let signHere1 = docusign.SignHere.constructFromObject({
    anchorString: '/sn1/',
    anchorYOffset: '10',
    anchorUnits: 'pixels',
    anchorXOffset: '20',
  });
  // Tabs are set per recipient / signer
  let signer1Tabs = docusign.Tabs.constructFromObject({
    signHereTabs: [signHere1],
  });
  signer1.tabs = signer1Tabs;

  // Add the recipient to the envelope object
  let recipients = docusign.Recipients.constructFromObject({
    signers: [signer1],
  });
  env.recipients = recipients;

  // Request that the envelope be sent by setting |status| to "sent".
  // To request that the envelope be created as a draft, set to "created"
  env.status = 'sent';

  return env;
};
