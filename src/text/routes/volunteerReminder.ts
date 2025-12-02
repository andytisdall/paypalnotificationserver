import express from "express";
import twilio, { twiml } from "twilio";

import { requireSalesforceAuth } from "../../middlewares/require-salesforce-auth";
import { getTwilioClient } from "./outgoingText";
import getSecrets from "../../utils/getSecrets";
import { OutgoingText } from "./outgoingText";
import { VOLUNTEER_REMINDER_NUMBER } from "../models/phone";
import { getContactByPhoneNumber } from "../../utils/salesforce/SFQuery/contact/contact";
import {
  editHours,
  getTextReminderHours,
} from "../../utils/salesforce/SFQuery/volunteer/hours";
import { sendVolunteerShiftCancelEmail } from "../../volunteers/routes/hours/deleteHours";
import { IncomingText } from "./incomingText";

const MessagingResponse = twiml.MessagingResponse;

const router = express.Router();

router.post(
  "/incoming/volunteer",
  twilio.webhook({ protocol: "https" }),
  async (req, res) => {
    const { Body, From }: IncomingText = req.body;
    const formattedPhoneNumber = From.replace("+1", "");
    const contactId = await getContactByPhoneNumber(formattedPhoneNumber);

    let action = null;

    if (contactId) {
      const hoursId = await getTextReminderHours(contactId);
      if (hoursId) {
        let responseText = "";
        if (Body.toLowerCase() === "y") {
          action = "Confirmed";
        }
        if (Body.toLowerCase() === "n") {
          action = "Canceled";
          await sendVolunteerShiftCancelEmail({ contactId, hoursId });
        }
        if (action) {
          await editHours({
            id: hoursId,
            status: action,
            respondedToReminder: true,
          });
          responseText = `You have ${action.toLowerCase()} your volunteer shift. Thank you!`;
        } else {
          responseText =
            'Please reply with "Y" to confirm your volunteer shift or "N" to cancel it.';
        }
        const response = new MessagingResponse();
        response.message(responseText);
        res.set("Content-Type", "text/xml");
        return res.send(response.toString());
      }
    }

    res.send(null);
  }
);

router.post("/outgoing/volunteer", requireSalesforceAuth, async (req, res) => {
  const {
    message,
    number,
  }: {
    message: string;
    number: string;
  } = req.body;

  const { MESSAGING_SERVICE_SID } = await getSecrets(["MESSAGING_SERVICE_SID"]);

  if (!MESSAGING_SERVICE_SID) {
    throw Error(
      "No Messaging Service ID found, which is required to send a text message."
    );
  }

  const twilioClient = await getTwilioClient();

  if (!message) {
    res.status(422);
    throw new Error("No message to send");
  }

  const outgoingText: OutgoingText = {
    body: message,
    from: VOLUNTEER_REMINDER_NUMBER,
    messagingServiceSid: MESSAGING_SERVICE_SID,
  };

  const { sid } = await twilioClient.messages.create({
    ...outgoingText,
    to: "+1" + number,
  });

  res.status(201).send({ success: true, id: sid });
});

export default router;
