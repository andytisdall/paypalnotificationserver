import express from 'express';
import mongoose from 'mongoose';

import { currentD4JUser } from '../../middlewares/current-d4j-user';

const CocktailVote = mongoose.model('CocktailVote');

const router = express.Router();

interface Cocktail {
  name: string;
  ingredients: string;
  photo: string;
  bar: string; // salesforce ID of bar/restaurant
}

const COCKTAILS: Cocktail[] = [];

router.get('/contest/cocktails', async (req, res) => {
  res.send(COCKTAILS);
});

router.get('/contest/vote', currentD4JUser, async (req, res) => {
  if (!req.currentD4JUser) {
    throw Error('No user signed in');
  }

  const existingVote = await CocktailVote.find({ user: req.currentD4JUser.id });
  res.send(existingVote);
});

router.get('/contest/votes', async (req, res) => {
  const allVotes = await CocktailVote.find();
  res.send(allVotes);
});

router.post('/contest/vote', currentD4JUser, async (req, res) => {
  const { barId }: { barId: string } = req.body;
  if (!req.currentD4JUser) {
    throw Error('No user signed in');
  }

  const newVote = new CocktailVote({ user: req.currentD4JUser.id, bar: barId });
  await newVote.save();

  res.sendStatus(204);
});

router.patch('/contest/vote', currentD4JUser, async (req, res) => {
  const { barId }: { barId: string } = req.body;
  if (!req.currentD4JUser) {
    throw Error('No user signed in');
  }

  const existingVote = await CocktailVote.findOne({
    user: req.currentD4JUser.id,
  });

  if (!existingVote) {
    throw Error('No vote found');
  }

  existingVote.bar = barId;
  await existingVote.save();

  res.sendStatus(204);
});
