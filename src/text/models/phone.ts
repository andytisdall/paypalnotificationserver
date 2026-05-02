import mongoose from "mongoose";

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
    imgFail: Date,
    noImg: Boolean,
  },
  {
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

export const Phone = mongoose.model("Phone", phoneSchema);
