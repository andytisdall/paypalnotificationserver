import { Schema, model } from "mongoose";

const scheduledTextSchema = new Schema(
  {
    message: String,
    scheduledDate: Date,
    region: String,
    twilioIds: [String],
    canceled: { type: Boolean, default: false },
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

export const ScheduledText = model("ScheduledText", scheduledTextSchema);
