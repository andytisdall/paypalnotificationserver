import mongoose from 'mongoose';

const cocktailVoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'D4JUser',
      required: true,
      unique: true,
    },
    bar: {
      type: String, // salesforce ID of bar or restaurant
      required: true,
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

export const CocktailVote = mongoose.model('CocktailVote', cocktailVoteSchema);
