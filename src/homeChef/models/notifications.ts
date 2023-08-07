import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    message: String,
    date: { type: Date, default: new Date() },
    app: String,
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

export const Notifications = mongoose.model('Notification', notificationSchema);
