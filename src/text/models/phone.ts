import mongoose from 'mongoose';

export const REGIONS = {
  WEST_OAKLAND: '+15105297288',
  EAST_OAKLAND: '+15109301159',
};

export type Region = 'EAST_OAKLAND' | 'WEST_OAKLAND';

const phoneSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      unique: true,
    },
    region: [
      {
        type: String,
      },
    ],
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

export const Phone = mongoose.model('Phone', phoneSchema);
