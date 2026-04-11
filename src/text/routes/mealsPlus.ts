import express from "express";
import mongoose from "mongoose";
import twilio, { twiml } from "twilio";

import { getTwilioClient } from "./outgoingText";
import getSecrets from "../../utils/getSecrets";
import { Region, REGIONS } from "../models/phone";
import { OutgoingText } from "./outgoingText";
import { requireSalesforceAuth } from "../../middlewares/require-salesforce-auth";
import { NewOutgoingTextRecord } from "./outgoingText";
import {
  IncomingText,
  addPhoneNumber,
  removePhoneNumber,
  receiveFeedback,
} from "./incomingText";
import textResponses from "../textResponses";

const Phone = mongoose.model("Phone");
const OutgoingTextRecord = mongoose.model("OutgoingTextRecord");

const MessagingResponse = twiml.MessagingResponse;

const router = express.Router();

router.post("/outgoing/salesforce", requireSalesforceAuth, async (req, res) => {
  const { MESSAGING_SERVICE_SID } = await getSecrets(["MESSAGING_SERVICE_SID"]);

  if (!MESSAGING_SERVICE_SID) {
    throw Error(
      "No Messaging Service ID found, which is required for a scheduled message.",
    );
  }

  const { message, region }: { message: string; region: string } = req.body;
  const formattedRegion = region.replace(/ /g, "_").toUpperCase() as Region;

  const twilioClient = await getTwilioClient();

  if (!message) {
    res.status(422);
    throw new Error("No message to send");
  }

  let formattedNumbers: string[] = [];
  const responsePhoneNumber = REGIONS[formattedRegion];

  const allPhoneNumbers = await Phone.find({ region: formattedRegion });
  formattedNumbers = allPhoneNumbers.map((p) => p.number);

  // if (process.env.NODE_ENV !== "production") {
  formattedNumbers = ["+14158190251"];
  // }

  const outgoingText: OutgoingText = {
    body: message,
    from: responsePhoneNumber,
    messagingServiceSid: MESSAGING_SERVICE_SID,
  };

  const createOutgoingText = async (phone: string) => {
    const { sid } = await twilioClient.messages.create({
      ...outgoingText,
      to: phone,
    });
    return sid;
  };

  formattedNumbers.forEach(createOutgoingText);

  if (process.env.NODE_ENV === "production") {
    const newOutgoingTextRecord = new OutgoingTextRecord<NewOutgoingTextRecord>(
      {
        sender: "salesforce",
        region: "Resources",
        message,
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
    const { Body, From }: IncomingText = req.body;

    const keyword = Body.toLowerCase().replace(" ", "");

    const existingNumber = await Phone.findOne({ number: From });
    let responseText;

    const region = "RESOURCES";

    // sign up words - check for duplicate, and add region to existing users region or create new phone number
    if (textResponses.SIGN_UP_WORDS.includes(keyword)) {
      if (existingNumber && existingNumber.region.includes(region)) {
        responseText = "You are already signed up";
      } else {
        await addPhoneNumber(existingNumber, From, region);
        responseText = "You have signed up";
      }
    }

    // built in unsubscribe words for twilio. outgoing messages will be blocked until 'START' is texted
    else if (textResponses.CANCEL_WORDS.includes(keyword)) {
      await removePhoneNumber(existingNumber, region);
    }

    // if we receive a message from someone not signed up, give general info
    else if (
      !existingNumber?.region.includes(region) ||
      textResponses.INFO_WORD === keyword
    ) {
      responseText = "Here is some info about the resources number";
    }

    // if it's an existing user with text that has not been matched, it's treated as feedback
    else {
      await receiveFeedback({
        message: Body,
        sender: From,
        region,
        images: [],
      });
      responseText = "Feedback received";
    }

    if (responseText) {
      const response = new MessagingResponse();
      response.message(responseText);
      res.set("Content-Type", "text/xml");
      return res.send(response.toString());
    }
    res.send(null);
  },
);

export default router;
