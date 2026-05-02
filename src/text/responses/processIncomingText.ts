import mongoose from "mongoose";

import { addPhoneNumber, removePhoneNumber } from "../salesforce";
import { IncomingText, Region, REGIONS } from "../types";
import { SIGN_UP_WORDS, CANCEL_WORDS, INFO_WORD } from "./keywords";
import { responses } from "./responses";
import { receiveFeedback } from "../routes/feedback";

const Phone = mongoose.model("Phone");

export const getImages = (body: any) => {
  const images: string[] = [];
  for (let i = 0; i < body.NumMedia; i++) {
    images.push(body[`MediaUrl${i}`]);
  }
  return images;
};

export const routeTextToResponse = async (
  { Body, From, To }: IncomingText,
  images: string[],
  program: "ALERT" | "PLUS",
) => {
  const regions = Object.keys(REGIONS) as Region[];
  const region = regions.find((reg) => REGIONS[reg] === To);
  if (!region) {
    throw Error("could not map recipient number to a region");
  }

  const keyword = Body.toLowerCase().replace(" ", "");

  const existingNumber = await Phone.findOne({ number: From });

  // sign up words - check for duplicate, and add region to existing users region or create new phone number

  if (SIGN_UP_WORDS.includes(keyword)) {
    if (existingNumber && existingNumber.region.includes(region)) {
      return responses.duplicateResponse[program](region);
    }
    await addPhoneNumber(existingNumber, From, region);
    return responses.signUpResponse[program](region);
  }

  // built in unsubscribe words for twilio. outgoing messages will be blocked until 'START' is texted

  if (CANCEL_WORDS.includes(keyword)) {
    await removePhoneNumber(existingNumber, region);
    return null;
  }

  // if we receive a message from someone not signed up, give general info

  if (!existingNumber?.region.includes(region) || INFO_WORD === keyword) {
    return responses.generalInfoResponse[program](region);
  }

  // if it's an existing user with text that has not been matched, it's treated as feedback

  await receiveFeedback({ message: Body, sender: From, region, images });
  return responses.feedbackResponse[program](region);
};
