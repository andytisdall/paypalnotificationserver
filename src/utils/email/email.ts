import { ServerClient } from "postmark";

import getSecrets from "../getSecrets";
import urls from "../urls";

export interface EmailMessage {
  to: string;
  from: string;
  subject: string;
  mediaUrl?: string[];
  text?: string;
  html: string;
}

const initializeEmail = async () => {
  const { POSTMARK_API_KEY } = await getSecrets(["POSTMARK_API_KEY"]);
  if (!POSTMARK_API_KEY) {
    throw Error("No Postmark API key");
  }

  return new ServerClient(POSTMARK_API_KEY);
};

export const sendEmail = async (msg: EmailMessage) => {
  const emailClient = await initializeEmail();

  await emailClient.sendEmail({
    From: msg.from,
    To: msg.to,
    Subject: msg.subject,
    HtmlBody: msg.html,
    TextBody: msg.text,
  });
};

export const sendEmailToSelf = async ({
  subject,
  message,
}: {
  subject: string;
  message: string;
}) => {
  const msg = {
    to: "andy@ckoakland.org",
    from: urls.adminEmail,
    subject,
    html: "Sent to self from server: " + message,
    text: "Sent to self from server: " + message,
  };

  await sendEmail(msg);
};
