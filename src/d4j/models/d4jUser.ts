import mongoose from "mongoose";

const d4jUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    token: String,
    salesforceId: String,
    secretCode: String,
    unconfirmed: { type: Boolean, default: false },
  },

  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

export const D4JUser = mongoose.model("D4JUser", d4jUserSchema);
