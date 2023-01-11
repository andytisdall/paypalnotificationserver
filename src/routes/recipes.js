const express = require('express');
const fs = require('fs-extra');
const path = require('path');

const { currentUser } = require('../middlewares/current-user.js');
const { requireAuth } = require('../middlewares/require-auth');
const { requireAdmin } = require('../middlewares/require-admin');
const { Recipe } = require('../models/recipe');

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://coherent-vision-368820.uw.r.appspot.com/images/'
    : 'http://localhost:3001/images/';

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
    const fileName = name + path.extname(req.files.image.name);
    const imageUrl = BASE_URL + fileName;

    if (req.files) {
      const imagePath = 'src/images/' + fileName;
      const stream = fs.createWriteStream(imagePath);
      stream.write(req.files.image.data);
      stream.end();
    }

    const newRecipe = new Recipe({
      name,
      ingredients: ingredientsList,
      instructions: instructionsList,
      description,
      image: imageUrl,
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
