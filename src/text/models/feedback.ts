import { Schema, model } from 'mongoose';

const feedbackSchema = new Schema(
  {
    message: String,
    date: { type: Date, default: Date.now() },
    sender: String,
    region: String,
    read: { type: Boolean, default: false },
    images: [String],
    response: [Object],
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

export const Feedback = model('Feedback', feedbackSchema);
