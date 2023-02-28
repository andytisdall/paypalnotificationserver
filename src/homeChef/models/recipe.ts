import mongoose from 'mongoose';

export type RecipeCategory =
  | 'mains'
  | 'sides'
  | 'veggies'
  | 'soups'
  | 'desserts';

const recipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ingredients: { type: [String], required: true },
    instructions: { type: [String], required: true },
    description: String,
    image: String,
    author: String,
    category: { type: String, required: true },
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

export const Recipe = mongoose.model('Recipe', recipeSchema);
