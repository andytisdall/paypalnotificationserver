import express from "express";
import twilio from "twilio";
import { format } from "date-fns";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";
import { createHash } from "crypto";

import { REGIONS, Region } from "../models/phone";
import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import urls from "../../utils/urls";
import { storeFile } from "../../files/google/storeFileGoogle";
import getSecrets from "../../utils/getSecrets";

const Phone = mongoose.model("Phone");
const Feedback = mongoose.model("Feedback");
const OutgoingTextRecord = mongoose.model("OutgoingTextRecord");

export interface NewOutgoingTextRecord {
  message?: string;
  sender: string;
  region: string;
  image?: string;
  date?: Date;
}

const smsRouter = express.Router();

export type OutgoingText = {
  from: string;
  body?: string;
  mediaUrl?: string[];
  sendAt?: Date;
  messagingServiceSid: string;
  scheduleType?: "fixed";
  validityPeriod?: number;
};

smsRouter.post("/outgoing", currentUser, requireAuth, async (req, res) => {
  const twilioClient = await getTwilioClient();

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

  let formattedRegion = region.toUpperCase().replace(" ", "_") as
    | Region
    | "ALL";

  if (![...Object.keys(REGIONS), "ALL"].includes(formattedRegion) && !number) {
    throw Error("Invalid region specified: " + region);
  }

  let formattedNumbers: string[] = [];
  const responsePhoneNumber =
    formattedRegion === "ALL" || number
      ? REGIONS.WEST_OAKLAND
      : REGIONS[formattedRegion];

  if (!number) {
    const allPhoneNumbers =
      region === "all"
        ? await Phone.find({
            region: {
              $in: ["EAST_OAKLAND", "WEST_OAKLAND", "BERKELEY"],
            },
          })
        : await Phone.find({ region: formattedRegion });
    formattedNumbers = allPhoneNumbers.map((p) => p.number);
  } else {
    const phoneNumber = number.replace(/[^\d]/g, "");
    if (phoneNumber.length !== 10) {
      res.status(422);
      throw new Error("Phone number must have 10 digits");
    }

    formattedNumbers = ["+1" + phoneNumber];
  }

  if (process.env.NODE_ENV !== "production") {
    formattedNumbers = formattedNumbers.filter((num) => num === "+14158190251");
  }

  // photo

  const outgoingText: OutgoingText = {
    body: message,
    from: responsePhoneNumber,
    messagingServiceSid: MESSAGING_SERVICE_SID,
  };

  if (attachedPhoto) {
    let photoArray: fileUpload.UploadedFile[] = [];
    if (Array.isArray(attachedPhoto)) {
      photoArray = attachedPhoto;
    } else {
      photoArray = [attachedPhoto];
    }

    const photoUrlPromises = photoArray.map(async (photoFile, i) => {
      const hash = createHash("md5")
        .update(req.currentUser!.username)
        .digest("hex");

      const fileName =
        "outgoing-text-" +
        format(new Date(), "yyyy-MM-dd-hh-mm-ss-a") +
        `-${hash}-${i}`;

      return await storeFile({
        file: photoFile,
        name: fileName,
      });
    });

    outgoingText.mediaUrl = await Promise.all(photoUrlPromises);
  } else if (photo) {
    outgoingText.mediaUrl = [photo];
  }
  const mediaUrl = outgoingText.mediaUrl ? outgoingText.mediaUrl[0] : undefined;

  //

  const createOutgoingText = async (phone: string) => {
    return await twilioClient.messages.create({ ...outgoingText, to: phone });
  };

  const textPromises = formattedNumbers.map(createOutgoingText);
  await Promise.all(textPromises);

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

  if (process.env.NODE_ENV === "production") {
    const newOutgoingTextRecord = new OutgoingTextRecord<NewOutgoingTextRecord>(
      {
        sender: req.currentUser!.id,
        region: number || region,
        message,
        image: mediaUrl,
      },
    );
    await newOutgoingTextRecord.save();
  }

  res.send({
    message,
    region: formattedRegion,
    photoUrl: mediaUrl,
    number,
    storedText,
  });
});

smsRouter.post(
  "/outgoing/mobile",
  async (req, res, next) => {
    req.url = "/outgoing";
    next();
  },
  smsRouter,
);

export const getTwilioClient = async () => {
  const { TWILIO_ID, TWILIO_AUTH_TOKEN } = await getSecrets([
    "TWILIO_ID",
    "TWILIO_AUTH_TOKEN",
  ]);
  if (!TWILIO_ID || !TWILIO_AUTH_TOKEN) {
    throw Error("Could not find twilio credentials");
  }
  return new twilio.Twilio(TWILIO_ID, TWILIO_AUTH_TOKEN, { autoRetry: true });
};

export default smsRouter;
