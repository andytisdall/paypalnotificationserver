import { ServerClient } from "postmark";
// import sgMail from "@sendgrid/mail";

import getSecrets from "../getSecrets";
// import urls from "../urls";

export interface EmailMessage {
  to: string;
  from: string;
  subject: string;
  mediaUrl?: string[];
  text?: string;
  html: string;
}

export const sendEmail = async (msg: EmailMessage) => {
  const { POSTMARK_API_KEY } = await getSecrets(["POSTMARK_API_KEY"]);
  if (!POSTMARK_API_KEY) {
    throw Error("No Postmark API key");
  }

  const emailClient = new ServerClient(POSTMARK_API_KEY);

  await emailClient.sendEmail({
    From: msg.from,
    To: msg.to,
    Subject: msg.subject,
    HtmlBody: msg.html,
    TextBody: msg.text,
  });
};

// export const initializeEmail = async () => {
//   const { SENDGRID_KEY } = await getSecrets(["SENDGRID_KEY"]);
//   if (!SENDGRID_KEY) {
//     throw new Error("Could not find sendgrid key to initialize email");
//   }
//   sgMail.setApiKey(SENDGRID_KEY);
// };

// export const sendEmail = async (msg: EmailMessage) => {
//   await initializeEmail();
//   await sgMail.send(msg);
//   console.log("Email sent to " + msg.to);
// };

// export const sendEmailToSelf = async ({
//   subject,
//   message,
// }: {
//   subject: string;
//   message: string;
// }) => {
//   const msg = {
//     to: "andy@ckoakland.org",
//     from: urls.adminEmail,
//     subject,
//     html: "Sent to self from server: " + message,
//     text: "Sent to self from server: " + message,
//   };

//   await sendEmail(msg);
// };
