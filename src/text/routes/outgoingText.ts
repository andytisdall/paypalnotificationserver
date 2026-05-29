import express from "express";
import { format } from "date-fns";
import mongoose from "mongoose";

import { getTwilioClient } from "../createTwilioClient";
import { Region, REGIONS } from "../types";
import { requireAuth } from "../../middlewares/require-auth";
import urls from "../../utils/urls";
import getSecrets from "../../utils/getSecrets";
import { savePhoto } from "../savePhoto";
import { OutgoingText, NewOutgoingTextRecord } from "../types";
import { sendTexts } from "../sendTexts";

const Feedback = mongoose.model("Feedback");
const OutgoingTextRecord = mongoose.model("OutgoingTextRecord");
const Phone = mongoose.model("Phone");

const smsRouter = express.Router();

smsRouter.post("/outgoing", requireAuth, async (req, res) => {
  const {
    message,
    region,
    feedbackId,
    number,
    photo,
    storedText,
  }: {
    message?: string;
    region: Region | "all" | "East Oakland" | "West Oakland" | "Berkeley";
    feedbackId?: string;
    number?: string;
    photo?: string;
    storedText?: string;
  } = req.body;

  const attachedPhoto = req.files?.photo;

  const { MESSAGING_SERVICE_SID } = await getSecrets(["MESSAGING_SERVICE_SID"]);

  if (!MESSAGING_SERVICE_SID) {
    throw Error("Could not find messaging service ID");
  }

  const twilioClient = await getTwilioClient();

  if (!message && !photo && !attachedPhoto) {
    res.status(422);
    throw new Error("No message or photo to send");
  }

  if (!region && !number) {
    res.status(422);
    throw new Error("No region or number specified");
  }

  if (req.currentUser!.id === urls.appleReviewerId) {
    throw Error("You are not authorized to send text alerts");
  }

  const formattedRegion = region.toUpperCase().replace(" ", "_") as
    | Region
    | "ALL";

  if (![...Object.keys(REGIONS), "ALL"].includes(formattedRegion) && !number) {
    throw Error("Invalid region specified: " + region);
  }

  // photo

  let mediaUrl: string[] = [];

  if (attachedPhoto) {
    mediaUrl = await savePhoto(attachedPhoto, req.currentUser!.username);
  } else if (photo) {
    mediaUrl = [photo];
  }

  const outgoingText: Partial<OutgoingText> = {
    body: message,
    messagingServiceSid: MESSAGING_SERVICE_SID,
  };

  if (number) {
    const phoneNumber = number.replace(/[^\d]/g, "");
    if (phoneNumber.length !== 10) {
      res.status(422);
      throw new Error("Phone number must have 10 digits");
    }
    const phone = await Phone.findOne({ number: phoneNumber });
    const from = REGIONS[phone?.region[0] as Region] || REGIONS["WEST_OAKLAND"];
    await twilioClient.messages.create({
      ...outgoingText,
      from,
      to: phoneNumber,
      mediaUrl,
    });

    if (process.env.NODE_ENV !== "development") {
      const newOutgoingTextRecord =
        new OutgoingTextRecord<NewOutgoingTextRecord>({
          sender: req.currentUser!.id,
          region: number,
          message,
          image: mediaUrl[0],
          sendCount: 1,
        });
      newOutgoingTextRecord.save();
    }

    if (feedbackId) {
      const feedback = await Feedback.findById(feedbackId);
      if (feedback) {
        const response = { message, date: format(new Date(), "yyyy-MM-dd") };
        if (feedback.response) {
          feedback.response.push(response);
        } else {
          feedback.response = [response];
        }
        await feedback.save();
      }
    }
  } else {
    sendTexts(formattedRegion, outgoingText, twilioClient, mediaUrl).then(
      (sendCount) => {
        if (process.env.NODE_ENV !== "development") {
          const newOutgoingTextRecord =
            new OutgoingTextRecord<NewOutgoingTextRecord>({
              sender: req.currentUser!.id,
              region,
              message,
              image: mediaUrl[0],
              sendCount,
            });
          newOutgoingTextRecord.save();
        }
      },
    );
  }

  res.send({
    message,
    region: formattedRegion,
    photoUrl: mediaUrl[0],
    number,
    storedText,
  });
});

smsRouter.post(
  "/outgoing/mobile",
  async (req, _res, next) => {
    req.url = "/outgoing";
    next();
  },
  smsRouter,
);

export default smsRouter;
