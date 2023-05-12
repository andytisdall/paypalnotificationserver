import { RecipientViewRequest } from 'docusign-esign';

interface CreateViewArgs {
  signerClientId: string;
  signerEmail: string;
  signerName: string;
  envelopeId: string;
  dsReturnUrl: string;
  doc: string;
}

export default ({
  signerClientId,
  signerEmail,
  signerName,
  envelopeId,
  dsReturnUrl,
  doc,
}: CreateViewArgs) => {
  // Data for this method
  // args.dsReturnUrl
  // args.signerEmail
  // args.signerName
  // args.signerClientId
  // args.dsPingUrl

  let viewRequest: RecipientViewRequest = {
    // Set the url where you want the recipient to go once they are done signing
    // should typically be a callback route somewhere in your app.
    // The query parameter is included as an example of how
    // to save/recover state information during the redirect to
    // the DocuSign signing ceremony. It's usually better to use
    // the session mechanism of your web framework. Query parameters
    // can be changed/spoofed very easily.
    returnUrl: dsReturnUrl + `?envelopeId=${envelopeId}&doc=${doc}`,

    // How has your app authenticated the user? In addition to your app's
    // authentication, you can include authenticate steps from DocuSign.
    // Eg, SMS authentication
    authenticationMethod: 'none',

    // Recipient information must match embedded recipient info
    // we used to create the envelope.
    email: signerEmail,
    userName: signerName,
    clientUserId: signerClientId,

    // DocuSign recommends that you redirect to DocuSign for the
    // Signing Ceremony. There are multiple ways to save state.
    // To maintain your application's session, use the pingUrl
    // parameter. It causes the DocuSign Signing Ceremony web page
    // (not the DocuSign server) to send pings via AJAX to your
    // app,
    // viewRequest.pingFrequency = 600;  seconds
    // NOTE: The pings will only be sent if the pingUrl is an https address
    // viewRequest.pingUrl = args.dsPingUrl;  optional setting
  };
  return viewRequest;
};
