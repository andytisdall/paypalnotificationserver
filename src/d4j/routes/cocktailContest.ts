import express from "express";
import mongoose from "mongoose";

import { currentD4JUser } from "../../middlewares/current-d4j-user";

const CocktailVote = mongoose.model("CocktailVote");

const router = express.Router();

interface MixologyData {
  mixologist: string;
  restaurant: string;
  cocktail: string;
}

const data: MixologyData[] = [
  {
    mixologist: "Gina Igneri",
    restaurant: "Acre Kitchen & Bar",
    cocktail: "Oro Negro",
  },

  {
    mixologist: "Everth Oliva",
    restaurant: "Agave Uptown",
    cocktail: "Passion De Oaxaca",
  },

  {
    mixologist: "Juan Pablo Martinez",
    restaurant: "Bar Shiru",
    cocktail: "East Bay Grease",
  },

  {
    mixologist: "Trung Nguyen",
    restaurant: "Co Nam",
    cocktail: "Hart's Fire Bloom",
  },

  {
    mixologist: "John Marsh",
    restaurant: "District",
    cocktail: "This Is Ballhala!",
  },

  {
    mixologist: "Mikhela Ahl",
    restaurant: "Friends & Family",
    cocktail: "Wilder Heart",
  },

  {
    mixologist: "Manuel Porras",
    restaurant: "Fluid 510",
    cocktail: "Caramel Carrajito",
  },

  {
    mixologist: "Liz Sabogal",
    restaurant: "Jaji",
    cocktail: "The Favorite Daughter",
  },

  {
    mixologist: "Nelson German",
    restaurant: "Sobre Mesa",
    cocktail: "Caribbean Hart & Apples",
  },

  {
    mixologist: "Sunny Faichung Lam",
    restaurant: "Tallboy",
    cocktail: "35th's Finest",
  },

  {
    mixologist: "Sheldon Whiteside",
    restaurant: "Town Bar & Lounge",
    cocktail: "Ruby Reign",
  },

  {
    mixologist: "William Tsui",
    restaurant: "Viridian",
    cocktail: "Hart Of Gold",
  },
];

router.get("/contest/cocktails", async (req, res) => {
  res.send(data);
});

router.get("/contest/votes", async (req, res) => {
  const allVotes = await CocktailVote.find();
  res.send(allVotes);
});

router.post("/contest/vote", currentD4JUser, async (req, res) => {
  const { barId }: { barId: string } = req.body;
  if (!req.currentD4JUser) {
    throw Error("No user signed in");
  }

  const existingVote = await CocktailVote.findOne({
    user: req.currentD4JUser.id,
  });

  if (existingVote) {
    existingVote.bar = barId;
    await existingVote.save();
  } else {
    const newVote = new CocktailVote({
      user: req.currentD4JUser.id,
      bar: barId,
    });
    await newVote.save();
  }

  res.send(null);
});

router.get("/contest/winner", async (req, res) => {
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

  const sortedTotals = Object.keys(totals)
    .sort((a, b) => (totals[a] > totals[b] ? -1 : 1))
    .map((name) => `${name} - ${totals[name]} votes`);

  // const winningNumberOfVotes = Object.values(totals).reduce(
  //   (mostVotesSoFar, currentVote) =>
  //     currentVote > mostVotesSoFar ? currentVote : mostVotesSoFar,
  //   0
  // );

  // const winningIds = Object.keys(totals).filter(
  //   (bar) => totals[bar] === winningNumberOfVotes
  // );

  // const winningPromises = winningIds.map((id) => getAccountById(id));
  // const winningAccounts = await Promise.all(winningPromises);
  // const winningNames = winningAccounts.map(({ Name }) => Name);
  res.send(sortedTotals);
});

export default router;
