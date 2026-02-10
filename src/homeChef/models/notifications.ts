import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    payload: { title: String, body: String },
    date: { type: Date, default: () => new Date() },
    app: String,
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

export const Notifications = mongoose.model("Notification", notificationSchema);
