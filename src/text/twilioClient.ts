import twilio, { Twilio } from "twilio";

import getSecrets from "../utils/getSecrets";

class TwilioClient {
  public client?: Twilio;

  async initialize() {
    const { TWILIO_ID, TWILIO_AUTH_TOKEN } = await getSecrets([
      "TWILIO_ID",
      "TWILIO_AUTH_TOKEN",
    ]);
    if (!TWILIO_ID || !TWILIO_AUTH_TOKEN) {
      throw Error("Could not find twilio credentials");
    }
    this.client = new twilio.Twilio(TWILIO_ID, TWILIO_AUTH_TOKEN, {
      autoRetry: true,
    });
  }
}

export const twilioClient = new TwilioClient();
