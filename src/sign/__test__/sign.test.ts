import request from "supertest";
import mongoose from "mongoose";

import app from "../../..";
import { WebhookBody } from "../routes/updateContact";

const User = mongoose.model("User");

it("uploads a signed document from zoho sign to salesforce", async () => {
  const body: WebhookBody = {
    requests: {
      request_status: "",
      request_id: "",
      actions: [{ recipient_email: "andy@ckoakland.org" }],
      document_ids: [
        {
          document_id: "489948000000099043",
          document_name: "CK Kitchen Volunteer Agreement",
        },
      ],
    },
  };
  await request(app).post("/api/sign/update-contact").send(body).expect(200);
});
