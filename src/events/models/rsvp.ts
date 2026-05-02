import mongoose from "mongoose";

const rsvpSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    additional: Boolean,
    numberOfPeople: String,
    numberOfAdditional: String,
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

export const RSVP = mongoose.model("RSVP", rsvpSchema);
