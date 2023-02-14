import express from 'express';
import path from 'path';
import mongoose from 'mongoose';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';
import { storeFile } from '../../files/storeFile';

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

router.post(
  '/recipe',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { name, ingredients, instructions, description } = req.body;

    const ingredientsList = ingredients.split('\n');
    const instructionsList = instructions.split('\n');
    let fileName = '';

    if (req.files?.image && !Array.isArray(req.files.image)) {
      const extension = path.extname(req.files.image.name);
      fileName = 'recipes-' + name + extension;
      await storeFile({
        data: req.files.image.data,
        name: fileName,
      });
    }

    const newRecipe = new Recipe({
      name,
      ingredients: ingredientsList,
      instructions: instructionsList,
      description,
      image: fileName,
    });
    await newRecipe.save();
    res.status(201).send(newRecipe);
  }
);

router.patch(
  '/recipe',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { recipeId, name, ingredients, instructions, description } = req.body;
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      res.status(404);
      throw new Error('Recipe not found');
    }
    if (name) {
      recipe.name = name;
    }
    if (ingredients) {
      recipe.ingredients = ingredients.split('\n');
    }
    if (instructions) {
      recipe.instructions = instructions.split('\n');
    }
    recipe.description = description;
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
