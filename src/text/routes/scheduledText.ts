import express from "express";
import { zonedTimeToUtc } from "date-fns-tz";
import { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";

import { getTwilioClient } from "./outgoingText";
import getSecrets from "../../utils/getSecrets";
import { REGIONS, Region } from "../models/phone";
import { OutgoingText } from "./outgoingText";
import { requireSalesforceAuth } from "../../middlewares/require-salesforce-auth";
import mongoose from "mongoose";
import { formatISO } from "date-fns";
import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { requireAdmin } from "../../middlewares/require-admin";

const Phone = mongoose.model("Phone");
const ScheduledText = mongoose.model("ScheduledText");

interface NewScheduledTextRecord {
  message: string;
  scheduledDate: Date;
  region: string;
  twilioIds: string[];
}

const router = express.Router();

router.post("/outgoing/salesforce", requireSalesforceAuth, async (req, res) => {
  const { MESSAGING_SERVICE_SID } = await getSecrets(["MESSAGING_SERVICE_SID"]);

  if (!MESSAGING_SERVICE_SID) {
    throw Error(
      "No Messaging Service ID found, which is required for a scheduled message."
    );
  }

  const {
    message,
    region,
    sendAt,
  }: {
    message: string;
    region: Region;
    sendAt: string;
  } = req.body;

  const twilioClient = await getTwilioClient();

  if (!message) {
    res.status(422);
    throw new Error("No message to send");
  }

  if (!region) {
    res.status(422);
    throw new Error("No region specified");
  }

  if (!sendAt) {
    res.status(422);
    throw new Error("No time specified");
  }

  let formattedNumbers: string[] = [];
  const responsePhoneNumber = REGIONS[region];

  // const allPhoneNumbers = await Phone.find({ region });
  // formattedNumbers = allPhoneNumbers.map((p) => p.number);

  formattedNumbers = [
    "+14158190251",
    //   // '+15104098582',
    //   // '+17185017050',
    //   // '+14157557053',
  ];

  const dateTime = new Date(sendAt);
  dateTime.setHours(12);
  dateTime.setMinutes(0);

  // const formattedTime = formatISO(dateTime);
  const zonedTime = zonedTimeToUtc(dateTime, "America/Los_Angeles");

  const outgoingText: OutgoingText = {
    body: message,
    from: responsePhoneNumber,
    sendAt: zonedTime,
    messagingServiceSid: MESSAGING_SERVICE_SID,
    scheduleType: "fixed",
  };

  const createOutgoingText = async (phone: string) => {
    const { sid } = await twilioClient.messages.create({
      ...outgoingText,
      to: phone,
    });
    return sid;
  };

  const textPromises = formattedNumbers.map(createOutgoingText);
  const results = await Promise.all(textPromises);

  const newScheduledTextRecord = new ScheduledText<NewScheduledTextRecord>({
    region,
    message,
    scheduledDate: zonedTime,
    twilioIds: results,
  });
  await newScheduledTextRecord.save();

  if (!newScheduledTextRecord?.id) {
    console.log(newScheduledTextRecord);
    throw Error("Scheduled Text Object ID not obtained");
  }
  res.status(201);
  res.send({ success: true, id: newScheduledTextRecord.id });
});

// delete route from salesforce to this server
router.get(
  "/outgoing/salesforce/:id",
  requireSalesforceAuth,
  async (req, res) => {
    const { id } = req.params;
    const twilioClient = await getTwilioClient();

    const scheduledText = await ScheduledText.findById(id);

    if (!scheduledText) {
      throw Error("Scheduled text not found");
    }

    const promises = scheduledText.twilioIds.map((sid: string) => {
      twilioClient.messages(sid).update({ status: "canceled" });
    });

    await Promise.all(promises);

    scheduledText.canceled = true;
    await scheduledText.save();

    res.send({ success: true });
  }
);

router.post(
  "/outgoing/salesforce/update",
  requireSalesforceAuth,
  async (req, res) => {
    const { id, message }: { id: string; message: string; time: string } =
      req.body;
    const twilioClient = await getTwilioClient();

    const scheduledText = await ScheduledText.findById(id);

    if (!scheduledText) {
      throw Error("Scheduled text not found");
    }

    const promises = scheduledText.twilioIds.map((sid: string) => {
      twilioClient.messages(sid).update({ body: message });
    });

    await Promise.all(promises);
    scheduledText.message = message;
    await scheduledText.save();

    res.send({ success: true });
  }
);

router.get(
  "/scheduled",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const twilioClient = await getTwilioClient();
    const options = {
      limit: 3000,
      dateSent: undefined,
    };
    const messages = await twilioClient.messages.list(options);
    res.send(messages.filter((txt) => txt.status === "scheduled"));
  }
);

router.post(
  "/scheduled/delete",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { ids }: { ids: string[] } = req.body;

    const twilioClient = await getTwilioClient();

    const promises = ids.map((id: string) => {
      return twilioClient.messages(id).update({ status: "canceled" });
    });
    const updatedMessages = await Promise.all(promises);

    res.send(updatedMessages);
  }
);

export default router;
