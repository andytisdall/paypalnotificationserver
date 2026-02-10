import mongoose from "mongoose";
import { formatISO } from "date-fns";

const supplyOrder = new mongoose.Schema(
  {
    items: {
      type: {
        labels: Number,
        containers: Number,
        soup: Number,
        sandwich: Number,
      },
      required: true,
    },
    contact: {
      type: { firstName: String, lastName: String, email: String },
      required: true,
    },
    fulfilled: { type: Boolean, default: false },
    date: { type: Date, default: () => formatISO(new Date()) },
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

export const SupplyOrder = mongoose.model("SupplyOrder", supplyOrder);
