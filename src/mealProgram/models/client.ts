import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true, unique: true },
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

export const Client = mongoose.model("Client", clientSchema);
