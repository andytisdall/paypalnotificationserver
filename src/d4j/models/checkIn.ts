import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'D4JUser',
      required: true,
    },
    restaurant: {
      type: String,
      required: true,
    },
    date: { type: Date, default: () => new Date() },
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

export const CheckIn = mongoose.model('CheckIn', checkInSchema);
