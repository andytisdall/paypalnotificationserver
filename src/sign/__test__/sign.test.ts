import request from "supertest";
import mongoose from "mongoose";

import app from "../../..";
import { DocWebhookBody } from "../routes/updateContact";

const User = mongoose.model("User");

it("gets a redirect url from the sign documents route", async () => {
  const token = await global.getToken({ admin: false });
  const [user] = await User.find();

  await request(app)
    .get("/api/sign/HC/" + user.salesforceId)
    .set("Authorization", token)
    .expect(200);
});

it("uploads a file from docusign to salesforce for both contact and restaurant accounts", async () => {
  await global.getToken({ admin: false });
  const requestBody: DocWebhookBody = {
    eventType: "envelope_signed",
    envelope: {
      id: "Byb5znktrCGMACMWPJMvNfnNRMfqFi2oE",
      recipients: [{ email: "andy@ckoakland.org" }],
      docName: "CK Kitchen Volunteer Agreement",
    },
  };

  await request(app)
    .post("/api/sign/update-contact")
    .send(requestBody)
    .expect(204);
});
