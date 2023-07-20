import { Schema, model } from 'mongoose';

const outgoingTextRecordSchema = new Schema(
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

export const OutgoingTextRecord = model(
  'OutgoingTextRecord',
  outgoingTextRecordSchema
);
