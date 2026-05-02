import twilio from "twilio";

import getSecrets from "../utils/getSecrets";

export const getTwilioClient = async () => {
  const { TWILIO_ID, TWILIO_AUTH_TOKEN } = await getSecrets([
    "TWILIO_ID",
    "TWILIO_AUTH_TOKEN",
  ]);
  if (!TWILIO_ID || !TWILIO_AUTH_TOKEN) {
    throw Error("Could not find twilio credentials");
  }
  return new twilio.Twilio(TWILIO_ID, TWILIO_AUTH_TOKEN, { autoRetry: true });
};
