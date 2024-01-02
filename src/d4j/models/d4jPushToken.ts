import mongoose from 'mongoose';

const d4jPushTokenSchema = new mongoose.Schema(
  {
    token: { type: String, unique: true },
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

export const D4jPushToken = mongoose.model('D4jPushToken', d4jPushTokenSchema);
