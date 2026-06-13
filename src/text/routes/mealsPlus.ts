import express from "express";
import mongoose from "mongoose";
import twilio, { twiml } from "twilio";

import { getTwilioClient } from "../createTwilioClient";
import getSecrets from "../../utils/getSecrets";
import {
  Region,
  OutgoingText,
  NewOutgoingTextRecord,
  IncomingText,
  TEST_NUMBER,
} from "../types";
import { requireSalesforceAuth } from "../../middlewares/require-salesforce-auth";
import { getRegionSubscribers } from "../getSubscribers";
import {
  getImages,
  routeTextToResponse,
} from "../responses/processIncomingText";
import { sendTexts } from "../sendTexts";
import { requireAdmin } from "../../middlewares/require-admin";
import { addPhoneNumber } from "../salesforce";

const Phone = mongoose.model("Phone");
const OutgoingTextRecord = mongoose.model("OutgoingTextRecord");

const router = express.Router();

router.post("/outgoing/salesforce", requireSalesforceAuth, async (req, res) => {
  const {
    message,
    region,
    photo,
  }: { message: string; region: string; photo: string } = req.body;
  const formattedRegion = region.replace(/ /g, "_").toUpperCase() as
    | Region
    | "ALL";

  const { MESSAGING_SERVICE_SID } = await getSecrets(["MESSAGING_SERVICE_SID"]);

  if (!MESSAGING_SERVICE_SID) {
    throw Error(
      "No Messaging Service ID found, which is required for a scheduled message.",
    );
  }

  const twilioClient = await getTwilioClient();

  const outgoingText: Partial<OutgoingText> = {
    body: message ? message : undefined,
    messagingServiceSid: MESSAGING_SERVICE_SID,
  };

  let subscribers = await getRegionSubscribers(formattedRegion);

  if (process.env.NODE_ENV !== "production") {
    subscribers = { RESOURCES: [TEST_NUMBER] };
  }

  const mediaUrl = photo ? [photo] : [];

  sendTexts(formattedRegion, outgoingText, twilioClient, mediaUrl).then(
    (sendCount) => {
      if (process.env.NODE_ENV === "production") {
        const newOutgoingTextRecord =
          new OutgoingTextRecord<NewOutgoingTextRecord>({
            sender: "salesforce",
            region,
            message,
            image: photo,
            sendCount,
          });
        newOutgoingTextRecord.save();
      }
    },
  );

  res.status(200);
  res.send({ success: true });
});

router.post(
  "/incoming/resources",
  twilio.webhook({ protocol: "https" }),
  async (req, res) => {
    const { Body, From, To }: IncomingText = req.body;
    const images = getImages(req.body);

    const responseText = await routeTextToResponse(
      { Body, From, To },
      images,
      "PLUS",
    );

    if (responseText) {
      const response = new twiml.MessagingResponse();
      response.message(responseText);
      res.set("Content-Type", "text/xml");
      return res.send(response.toString());
    }
    res.send(null);
  },
);

router.post("/migrate", requireAdmin, async (req, res) => {
  const users = await Phone.find({ region: { $ne: [] } });

  for (let user of users) {
    await addPhoneNumber(user, user.number, "RESOURCES");
  }

  res.send(users);
});

export default router;
