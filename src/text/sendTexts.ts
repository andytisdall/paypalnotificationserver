import { Twilio } from "twilio";

import { Region, OutgoingText, REGIONS } from "./types";
import { getRegionSubscribers } from "./getSubscribers";

export const sendTexts = async (
  region: Region | "ALL",
  outgoingText: Partial<OutgoingText>,
  twilioClient: Twilio,
  mediaUrl?: string[],
) => {
  let subscribers = await getRegionSubscribers(region);

  if (process.env.NODE_ENV === "development") {
    subscribers = { WEST_OAKLAND: ["+14158190251"] };
  }

  let sendCount = 0;

  try {
    for (let reg in subscribers) {
      const regionNums = subscribers[reg as Region];

      if (regionNums) {
        for (let phone of regionNums) {
          await twilioClient.messages.create({
            ...outgoingText,
            from: REGIONS[reg as Region],
            to: phone,
            mediaUrl,
          });
          sendCount++;
        }
      }
    }

    return sendCount;
  } catch (err) {
    // give app users a sensible error message if twilio doesn't work for any reason

    console.log(err);
    throw Error(
      "The CK Text Service is currently out of service. Please check back later.",
    );
  }
};
