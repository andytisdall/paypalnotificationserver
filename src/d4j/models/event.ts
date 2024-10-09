import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    contestActive: Boolean,
    styleMonthActive: Boolean,
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

export const Event = mongoose.model('Event', eventSchema);
