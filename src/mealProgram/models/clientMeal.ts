import mongoose from "mongoose";

const clientMealSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    amount: { type: Number, required: true },
    logged: { type: Boolean, default: false },
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

export const ClientMeal = mongoose.model("ClientMeal", clientMealSchema);
