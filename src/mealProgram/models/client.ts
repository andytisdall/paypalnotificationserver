import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    cCode: { type: String },
    barcode: { type: [String], default: [] },
    cCodeIncorrect: { type: Boolean, default: false },
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

export const Client = mongoose.model("Client", clientSchema);
