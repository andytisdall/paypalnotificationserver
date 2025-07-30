import request from "supertest";
import mongoose from "mongoose";

import app from "../../..";

const User = mongoose.model("User");

it.skip("uploads a file from docusign to salesforce for both contact and restaurant accounts", async () => {
  const token = await global.getToken({ admin: false });
  const envelopeId = "b84b318d-4fa8-4d6e-a0dc-4689564192fc";
  const [user] = await User.find();
  await request(app)
    .post("/api/sign/update-contact")
    .send({
      requests: {
        request_status: "completed",
        actions: [{ recipient_email: "andy@ckoakland.org" }],
        document_ids: [
          {
            document_name: "CK Home Chef Volunteer Agreement",
            document_id: "354AB079-OO36GZWBU55Q9QZAMJVRO_CVGO505RJ-7QFUO_BYU6O",
          },
        ],
        request_id: "489948000000058015",
      },
    })
    .expect(201);
});
