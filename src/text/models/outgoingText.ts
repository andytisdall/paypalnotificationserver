import { Schema, model } from 'mongoose';

const outgoingTextSchema = new Schema(
  {
    message: String,
    date: { type: Date, default: Date.now() },
    sender: String,
    region: String,
    image: String,
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

export const OutgoingText = model('OutgoingText', outgoingTextSchema);
