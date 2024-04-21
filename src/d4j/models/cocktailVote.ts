import mongoose from 'mongoose';

const cocktailVoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'D4JUser',
      required: true,
      unique: true,
    },
    cocktail: {
      type: String,
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
