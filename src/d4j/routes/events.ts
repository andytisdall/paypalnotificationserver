import express from 'express';
import mongoose from 'mongoose';

import { getD4JCampaigns } from '../../utils/salesforce/SFQuery/campaign';
import { currentD4JUser } from '../../middlewares/current-d4j-user';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';
import { getAccountById } from '../../utils/salesforce/SFQuery/account';

const CocktailVote = mongoose.model('CocktailVote');

const router = express.Router();

const COCKTAIL_PARTICIPANT_IDS: string[] = [];

router.get('/events', async (req, res) => {
  const events = await getD4JCampaigns();

  res.send(events);
});

router.get('/events/cocktail-competition', async (req, res) => {
  res.send(COCKTAIL_PARTICIPANT_IDS);
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

router.post(
  '/contest/winner',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const allVotes = await CocktailVote.find();
    const totals: Record<string, number> = allVotes.reduce(
      (voteObj, currentVote) => {
        if (voteObj[currentVote.bar]) {
          voteObj[currentVote.bar] += 1;
        } else {
          voteObj[currentVote.bar] = 1;
        }
        return voteObj;
      },
      {}
    );

    console.log(totals);

    const winningNumberOfVotes = Object.values(totals).reduce(
      (mostVotesSoFar, currentVote) =>
        currentVote > mostVotesSoFar ? currentVote : mostVotesSoFar,
      0
    );

    const winningIds = Object.keys(totals).filter(
      (bar) => totals[bar] === winningNumberOfVotes
    );

    const winningPromises = winningIds.map((id) => getAccountById(id));
    const winningAccounts = await Promise.all(winningPromises);
    const winningNames = winningAccounts.map(({ Name }) => Name);
    res.send(winningNames);
  }
);

export default router;
