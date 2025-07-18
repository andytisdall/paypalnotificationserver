import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    cCode: { type: String },
    barcode: { type: String },
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
