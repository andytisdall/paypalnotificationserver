import mongoose from "mongoose";
import { utcToZonedTime, format } from "date-fns-tz";

const clientMealSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      default: () => format(new Date(), "yyyy-MM-dd"),
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    amount: { type: Number, required: true },
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

export const ClientMeal = mongoose.model("ClientMeal", clientMealSchema);
