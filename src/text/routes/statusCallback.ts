import express from "express";
import mongoose from "mongoose";
import { subMonths } from "date-fns";
import twilio from "twilio";

import { getTwilioClient } from "./outgoingText";
import { removeTextSubscriber } from "../../utils/salesforce/SFQuery/text";

const Phone = mongoose.model("Phone");

const router = express.Router();

interface StatusCallbackBody {
  From: string;
  MessageSid: string;
  MessageStatus: string;
  ErrorCode?: string;
}

const ERROR_CODES = {
  UNSUBSCRIBED: "21610",
  NO_MMS: "30011",
  UNKNOWN: "30005",
  UNREACHABLE: "30003",
};

const FAIL_LIMIT = 8;

router.post(
  "/message-status",
  twilio.webhook({ protocol: "https" }),
  async (req, res) => {
    const { MessageSid, ErrorCode }: StatusCallbackBody = req.body;

    if (ErrorCode && Object.values(ERROR_CODES).includes(ErrorCode)) {
      console.log("Text Callback Error Code: " + ErrorCode);

      const twilioClient = await getTwilioClient();
      const msg = await twilioClient.messages.get(MessageSid).fetch();
      const phoneNumber = await Phone.findOne({ number: msg.to });
      if (!phoneNumber) {
        console.log(
          "Text status callback error received but could not find phone number in db",
        );
        return res.sendStatus(200);
      }

      if (ERROR_CODES.UNSUBSCRIBED === ErrorCode) {
        await Phone.deleteOne({ _id: phoneNumber.id });
        await removeTextSubscriber(phoneNumber.number);
      } else if (
        ERROR_CODES.UNKNOWN === ErrorCode ||
        ERROR_CODES.UNREACHABLE === ErrorCode
      ) {
        if (!phoneNumber.fails) {
          phoneNumber.fails = [];
        }

        const failsWithinPeriod = phoneNumber.fails.filter(
          (date: Date) => date > subMonths(new Date(), 1),
        ).length;

        if (failsWithinPeriod < FAIL_LIMIT) {
          phoneNumber.fails.push(new Date());
          await phoneNumber.save();
          console.log("Fail registered");
        } else {
          await Phone.deleteOne({ _id: phoneNumber.id });
          await removeTextSubscriber(phoneNumber.number);
          console.log("Subscriber removed: " + phoneNumber.number);
        }
      } else if (ERROR_CODES.NO_MMS === ErrorCode) {
        const stopImgs =
          phoneNumber.imgFail && phoneNumber.imgFail > subMonths(new Date(), 1);

        if (stopImgs) {
          phoneNumber.noImg = true;
          console.log("Phone Number will no longer receive images");
        } else {
          phoneNumber.imgFail = new Date();
          console.log("MMS Error");
        }
        await phoneNumber.save();
      }
    }

    res.sendStatus(200);
  },
);

export default router;
