import mongoose from "mongoose";

export const REGIONS: Record<Region, string> = {
  WEST_OAKLAND: "+15105297288",
  EAST_OAKLAND: "+15109301159",
  BERKELEY: "+15106944697",
};

export const VOLUNTEER_REMINDER_NUMBER = "+15102886563";

export type Region = "EAST_OAKLAND" | "WEST_OAKLAND" | "BERKELEY";

const phoneSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      unique: true,
    },
    region: [
      {
        type: String,
      },
    ],
    fails: [{ type: Date }],
  },
  {
    toJSON: {
      transform(doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

export const Phone = mongoose.model("Phone", phoneSchema);
