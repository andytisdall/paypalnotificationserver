import express from 'express';
import path from 'path';
import mongoose from 'mongoose';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';
import { storeFile, deleteFile } from '../../files/storeFile';

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
    let image = '';

    if (req.files?.image && !Array.isArray(req.files.image)) {
      const fileName = 'recipes-' + name;
      image = await storeFile({
        file: req.files.image,
        name: fileName,
      });
    }

    const newRecipe = new Recipe({
      name,
      ingredients: ingredientsList,
      instructions: instructionsList,
      description,
      image,
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
    const { name, ingredients, instructions, description } = req.body;
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

    if (req.files?.image && !Array.isArray(req.files.image)) {
      if (recipe.image) {
        await deleteFile(recipe.image);
      }
      const fileName = 'recipes-' + name;
      recipe.image = await storeFile({
        file: req.files.image,
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
