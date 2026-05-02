import { Types, Document } from "mongoose";

export interface NewOutgoingTextRecord {
  message?: string;
  sender: string;
  region: string;
  image?: string;
  date?: Date;
}

export type OutgoingText = {
  from: string;
  body?: string;
  mediaUrl?: string[];
  sendAt?: Date;
  messagingServiceSid: string;
  scheduleType?: "fixed";
  validityPeriod?: number;
  to: string;
};

export interface FeedbackObject {
  message: string;
  sender: string;
  region: Region;
  images: string[];
}

export type PhoneNumber =
  | (Document<
      unknown,
      any,
      {
        number: string;
        region: string[];
      }
    > & {
      number: string;
      region: Region[];
    } & {
      _id: Types.ObjectId;
    })
  | null;

export interface IncomingText {
  Body: string;
  From: string;
  To: string;
}

export type Region = "EAST_OAKLAND" | "WEST_OAKLAND" | "BERKELEY" | "RESOURCES";

export const REGIONS: Record<Region, string> = {
  WEST_OAKLAND: "+15105297288",
  EAST_OAKLAND: "+15109301159",
  BERKELEY: "+15106944697",
  RESOURCES: "+15108673402",
};

export const regionKey: Record<Region, string> = {
  EAST_OAKLAND: "East Oakland",
  WEST_OAKLAND: "West Oakland",
  BERKELEY: "Berkeley",
  RESOURCES: "Resources",
};

export const VOLUNTEER_REMINDER_NUMBER = "+15102886563";
export const TEST_NUMBER = "+14158190251";
