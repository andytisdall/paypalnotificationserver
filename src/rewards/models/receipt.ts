import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: new Date(),
    },
    restaurant: {
      type: String,
      required: true,
    },
    approved: {
      type: Boolean,
      required: true,
      default: false,
    },
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

export const Receipt = mongoose.model('Receipt', receiptSchema);
