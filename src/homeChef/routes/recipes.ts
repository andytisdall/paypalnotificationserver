import express from 'express';
import mongoose from 'mongoose';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';
import { storeFile, deleteFile } from '../../files/storeFile';
import { RecipeCategory } from '../models/recipe';

const Recipe = mongoose.model('Recipe');

const router = express.Router();

router.get('/recipes', async (req, res) => {
  const recipes = await Recipe.find();
  res.send(recipes);
});

router.get('/recipe/:recipeId', async (req, res) => {
  const { recipeId } = req.params;

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found');
  }

  res.send(recipe);
});

type SectionField = { header: string; text: string };

interface RecipeFields {
  name: string;
  ingredients: string;
  instructions: string;
  category: RecipeCategory;
  description?: string;
  author?: string;
  bulk?: boolean;
}

const formatSections = (field: string) =>
  JSON.parse(field).map((item: SectionField) => {
    return { header: item.header, text: item.text.split('\n') };
  });

router.post(
  '/recipe',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const {
      name,
      ingredients,
      instructions,
      description,
      category,
      author,
    }: RecipeFields = req.body;

    let image = '';

    if (req.files?.photo && !Array.isArray(req.files.photo)) {
      const fileName = 'recipes-' + name;
      image = await storeFile({
        file: req.files.photo,
        name: fileName,
      });
    }

    const newRecipe = new Recipe({
      name,
      ingredients: formatSections(ingredients),
      instructions: formatSections(instructions),
      description,
      category,
      image,
      author,
    });
    await newRecipe.save();
    res.status(201).send(newRecipe);
  }
);

router.patch(
  '/recipe/:id',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const recipeId: string = req.params.id;
    const {
      name,
      ingredients,
      instructions,
      description,
      category,
      author,
    }: RecipeFields = req.body;
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      res.status(404);
      throw new Error('Recipe not found');
    }
    if (name) {
      recipe.name = name;
    }
    if (ingredients) {
      recipe.ingredients = formatSections(ingredients);
    }
    if (instructions) {
      recipe.instructions = formatSections(ingredients);
    }
    recipe.author = author;
    recipe.category = category;
    recipe.description = description;

    if (req.files?.photo && !Array.isArray(req.files.photo)) {
      if (recipe.image) {
        await deleteFile(recipe.image);
      }
      const fileName = 'recipes-' + name;
      recipe.image = await storeFile({
        file: req.files.photo,
        name: fileName,
      });
    }

    await recipe.save();
    res.send(recipe);
  }
);

router.delete(
  '/recipe/:id',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const id: string = req.params.id;
    await Recipe.deleteOne({ _id: id });
    res.sendStatus(204);
  }
);

export default router;
