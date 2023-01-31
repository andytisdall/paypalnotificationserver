const express = require('express');
const path = require('path');

const { currentUser } = require('../../middlewares/current-user.js');
const { requireAuth } = require('../../middlewares/require-auth');
const { requireAdmin } = require('../../middlewares/require-admin');
const { Recipe } = require('../../models/recipe');
const { uploadFile } = require('../../services/fileStorage');

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
  // heicToJpeg,
  async (req, res) => {
    const { name, ingredients, instructions, description } = req.body;

    const ingredientsList = ingredients.split('\n');
    const instructionsList = instructions.split('\n');
    let image = '';

    console.log(req.files.image);

    if (req.files?.image) {
      const extension = path.extname(req.files.image.name);
      const fileName = name + extension;
      const imageId = await uploadFile({
        data: req.files.image.data,
        name: fileName,
      });
      image = imageId + extension;
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

module.exports = router;
