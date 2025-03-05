import { Schema, model } from 'mongoose';

const outgoingTextRecordSchema = new Schema(
  {
    message: String,
    date: { type: Date, default: () => new Date() },
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
