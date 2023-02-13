"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function (_a) {
    // Data for this method
    // args.dsReturnUrl
    // args.signerEmail
    // args.signerName
    // args.signerClientId
    // args.dsPingUrl
    var signerClientId = _a.signerClientId, signerEmail = _a.signerEmail, signerName = _a.signerName, envelopeId = _a.envelopeId, dsReturnUrl = _a.dsReturnUrl;
    var viewRequest = {
        // Set the url where you want the recipient to go once they are done signing
        // should typically be a callback route somewhere in your app.
        // The query parameter is included as an example of how
        // to save/recover state information during the redirect to
        // the DocuSign signing ceremony. It's usually better to use
        // the session mechanism of your web framework. Query parameters
        // can be changed/spoofed very easily.
        returnUrl: dsReturnUrl + ("?envelopeId=" + envelopeId),
        // How has your app authenticated the user? In addition to your app's
        // authentication, you can include authenticate steps from DocuSign.
        // Eg, SMS authentication
        authenticationMethod: 'none',
        // Recipient information must match embedded recipient info
        // we used to create the envelope.
        email: signerEmail,
        userName: signerName,
        clientUserId: signerClientId,
    };
    return viewRequest;
});
