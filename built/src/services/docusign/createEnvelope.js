"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var mapAccountTypeToFiles = {
    restaurant: 'World_Wide_Corp_lorem.pdf',
    contact: 'Joshi.pdf',
};
exports.default = (function (_a) {
    var signerEmail = _a.signerEmail, signerName = _a.signerName, signerClientId = _a.signerClientId, accountType = _a.accountType;
    var doc = path_1.default.resolve(__dirname, 'contracts/' + mapAccountTypeToFiles[accountType]);
    // read file from a local directory
    // The read could raise an exception if the file is not available!
    var docPdfBytes = fs_extra_1.default.readFileSync(doc);
    var doc1b64 = Buffer.from(docPdfBytes).toString('base64');
    // add the documents
    var doc1 = {
        documentBase64: doc1b64,
        name: 'TestPDF',
        fileExtension: 'pdf',
        documentId: '3',
    };
    // Create signHere fields (also known as tabs) on the documents,
    // We're using anchor (autoPlace) positioning
    //
    // The DocuSign platform seaches throughout your envelope's
    // documents for matching anchor strings.
    var signHere1 = {
        anchorString: '/sn1/',
        anchorYOffset: '10',
        anchorUnits: 'pixels',
        anchorXOffset: '20',
    };
    // Tabs are set per recipient / signer
    var signer1Tabs = {
        signHereTabs: [signHere1],
    };
    // Create a signer recipient to sign the document, identified by name and email
    // We set the clientUserId to enable embedded signing for the recipient
    // We're setting the parameters via the object creation
    var signer1 = {
        email: signerEmail,
        name: signerName,
        clientUserId: signerClientId,
        recipientId: '1',
        tabs: signer1Tabs,
    };
    // Add the recipient to the envelope object
    var recipients = {
        signers: [signer1],
    };
    // Request that the envelope be sent by setting |status| to "sent".
    // To request that the envelope be created as a draft, set to "created"
    // create the envelope definition
    // The order in the docs array determines the order in the envelope
    var env = {
        emailSubject: 'Please sign this document',
        documents: [doc1],
        status: 'sent',
        recipients: recipients,
    };
    return env;
});
