import { ServerClient } from "postmark";

import getSecrets from "../getSecrets";

export interface EmailMessage {
  to: string;
  from: string;
  subject: string;
  mediaUrl?: string[];
  text?: string;
  bcc?: string;
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
    Bcc: msg.bcc,
  });
};
