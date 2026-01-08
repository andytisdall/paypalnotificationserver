import { ServerClient } from "postmark";

import getSecrets from "../getSecrets";

interface BaseEmail {
  from: string;
  subject: string;
  mediaUrl?: string[];
  text?: string;
  bcc?: string;
  html: string;
}

interface SingleEmail extends BaseEmail {
  to: string;
}

interface BatchEmail extends BaseEmail {
  to: string[];
}

export type EmailMessage = BatchEmail | SingleEmail;

export const sendEmail = async (msg: SingleEmail) => {
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
    Bcc: msg.bcc,
  });
};

export const sendBatchEmail = async (msg: BatchEmail) => {
  const { POSTMARK_API_KEY } = await getSecrets(["POSTMARK_API_KEY"]);
  if (!POSTMARK_API_KEY) {
    throw Error("No Postmark API key");
  }

  const emailClient = new ServerClient(POSTMARK_API_KEY);

  await emailClient.sendEmailBatch(
    msg.to.map((to) => ({
      From: msg.from,
      To: to,
      Subject: msg.subject,
      HtmlBody: msg.html,
    }))
  );
};
