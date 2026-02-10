import mongoose from "mongoose";

const paypalTxnSchema = new mongoose.Schema(
  {
    txnId: String,
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

export const PaypalTxn = mongoose.model("PaypalTxn", paypalTxnSchema);
