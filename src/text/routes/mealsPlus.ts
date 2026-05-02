import express from "express";
import mongoose from "mongoose";
import twilio, { twiml } from "twilio";

import { getTwilioClient } from "../createTwilioClient";
import getSecrets from "../../utils/getSecrets";
import {
  Region,
  REGIONS,
  OutgoingText,
  NewOutgoingTextRecord,
  IncomingText,
  TEST_NUMBER,
} from "../types";
import { requireSalesforceAuth } from "../../middlewares/require-salesforce-auth";
import { getSubscribers } from "../getSubscribers";
import {
  getImages,
  routeTextToResponse,
} from "../responses/processIncomingText";

const OutgoingTextRecord = mongoose.model("OutgoingTextRecord");

const router = express.Router();

router.post("/outgoing/salesforce", requireSalesforceAuth, async (req, res) => {
  const { MESSAGING_SERVICE_SID } = await getSecrets(["MESSAGING_SERVICE_SID"]);

  if (!MESSAGING_SERVICE_SID) {
    throw Error(
      "No Messaging Service ID found, which is required for a scheduled message.",
    );
  }

  const {
    message,
    region,
    photo,
  }: { message: string; region: string; photo: string } = req.body;
  const formattedRegion = region.replace(/ /g, "_").toUpperCase() as
    | Region
    | "ALL";

  const twilioClient = await getTwilioClient();

  const outgoingText: Partial<OutgoingText> = {
    body: message ? message : undefined,
    messagingServiceSid: MESSAGING_SERVICE_SID,
  };

  let { imgNumbersByRegion, noImgNumbersByRegion } =
    await getSubscribers(formattedRegion);

  if (process.env.NODE_ENV !== "production") {
    imgNumbersByRegion = { RESOURCES: [TEST_NUMBER] };
    noImgNumbersByRegion = {};
  }

  let regions = Object.keys(imgNumbersByRegion) as Region[];
  regions.forEach((reg) => {
    const numbers = imgNumbersByRegion[reg]!;
    const createOutgoingText = async (phone: string) => {
      await twilioClient.messages.create({
        ...outgoingText,
        from: REGIONS[reg],
        mediaUrl: [photo],
        to: phone,
      });
    };

    numbers.forEach(createOutgoingText);
  });

  if (message) {
    regions = Object.keys(noImgNumbersByRegion) as Region[];
    regions.forEach((reg) => {
      const numbers = noImgNumbersByRegion[reg]!;
      const createOutgoingText = async (phone: string) => {
        await twilioClient.messages.create({
          ...outgoingText,
          from: REGIONS[reg],
          to: phone,
        });
      };

      numbers.forEach(createOutgoingText);
    });
  }

  if (process.env.NODE_ENV === "production") {
    const newOutgoingTextRecord = new OutgoingTextRecord<NewOutgoingTextRecord>(
      {
        sender: "salesforce",
        region,
        message,
        image: photo,
      },
    );
    await newOutgoingTextRecord.save();
  }

  res.status(201);
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

export default router;
