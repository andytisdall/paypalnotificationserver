import { TemplateRole, EnvelopeDefinition } from 'docusign-esign';

const prodTemplates: Record<string, string> = {
  W9: '9fc27ab6-ceb6-471f-a7a4-bc875cd06942',
  RC: '44e64a6a-a0a1-4c5a-87de-bb62d5f28b1e',
  DD: 'ec16dfbd-9b80-4a0a-858f-ac5cb404df70',
  HC: '1b7dd9f3-cf35-4f6c-b667-69b9fd670b9e',
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
  // const document = createDocument(doc);

  // change account type to doc name and find the doc that way
  // refactor tab creation into function that can output the different docs
  // also needs to output email subject
  // might as well merge that with mapAccountToFiles

  // Create a signer recipient to sign the document, identified by name and email
  // We set the clientUserId to enable embedded signing for the recipient
  // We're setting the parameters via the object creation
  let signer: TemplateRole = {
    email: signerEmail,
    name: signerName,
    clientUserId: signerClientId,
    roleName: 'Signer',
    // tabs: document.tabs,
  };

  // Add the recipient to the envelope object

  // Request that the envelope be sent by setting |status| to "sent".
  // To request that the envelope be created as a draft, set to "created"

  // create the envelope definition
  // The order in the docs array determines the order in the envelope
  let env: EnvelopeDefinition = {
    emailSubject: 'CK: Complete this Document',
    // documents: [document.document],
    status: 'sent',
    templateId: templates[doc],
    templateRoles: [signer],
    // recipients,
  };

  return env;
};

// const mapDocNameToFiles: Record<string, Record<string, string>> = {
//   restaurantContract: {
//     file: 'World_Wide_Corp_lorem.pdf',
//     name: 'Restaurant Contact',
//     id: '1',
//   },
//   volunteerAgreement: {
//     file: 'volunteer_agreement.pdf',
//     name: 'Volunteer Agreement',
//     id: '2',
//   },
// };

// interface DocInfo {
//   tabs: Tabs;
//   emailSubject: string;
//   document: Document;
// }

// const createDocument = (docName: string): DocInfo => {
//   const fileName = path.resolve(__dirname, 'contracts', docName);
//   // read file from a local directory
//   // The read could raise an exception if the file is not available!
//   let docPdfBytes: Buffer;
//   try {
//     docPdfBytes = fs.readFileSync(fileName);
//   } catch {
//     throw Error('Could not find contract on CK server');
//   }

//   // add the documents
//   const doc: Document = {
//     documentBase64: Buffer.from(docPdfBytes).toString('base64'),
//     name: mapDocNameToFiles[docName].name, // can be different from actual file name
//     fileExtension: 'pdf',
//     documentId: mapDocNameToFiles[docName].id,
//   };

//   // Create signHere fields (also known as tabs) on the documents,
//   // We're using anchor (autoPlace) positioning
//   //
//   // The DocuSign platform seaches throughout your envelope's
//   // documents for matching anchor strings.
//   let signTab: SignHere = {
//     anchorString: '/sn1/',
//   };

//   let dateTab: DateSigned = {
//     anchorString: '/dt1/',
//   };

//   let nameTab: FullName = {
//     anchorString: '/fn1/',
//   };

//   let textTab: Text = {
//     anchorString: '/txt1/',
//   };

//   // Tabs are set per recipient / signer
//   let tabs: Tabs = {
//     signHereTabs: [signTab],
//     dateSignedTabs: [dateTab],
//     fullNameTabs: [nameTab],
//     textTabs: [textTab],
//   };

//   return {
//     document: doc,
//     emailSubject: mapDocNameToFiles[docName].subject,
//     tabs,
//   };
// };
