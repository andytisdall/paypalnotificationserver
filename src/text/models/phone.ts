import mongoose from 'mongoose';

export const REGIONS: Record<Region, string> = {
  WEST_OAKLAND: '+15105297288',
  EAST_OAKLAND: '+15109301159',
};

export const DROPOFF_NUMBER = '+15106944697';

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
