const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ingredients: [String],
    instructions: [String],
    description: String,
    image: String,
    author: String,
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

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = { Recipe };
