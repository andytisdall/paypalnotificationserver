import express from "express";
import mongoose from "mongoose";

import { currentD4JUser } from "../../middlewares/current-d4j-user";

const CURRENT_YEAR = 2026;

const CocktailVote = mongoose.model("CocktailVote");

const router = express.Router();

interface MixologyData {
  mixologist: string;
  restaurant: string;
  cocktail: string;
}

const PLACEHOLDER = "Placeholder";

const data: MixologyData[] = [
  {
    restaurant: "Acre Kitchen & Bar",
    mixologist: PLACEHOLDER,
    cocktail: PLACEHOLDER,
  },
  {
    restaurant: "Agave Uptown",
    mixologist: PLACEHOLDER,
    cocktail: PLACEHOLDER,
  },
  { restaurant: "Co Nam", mixologist: PLACEHOLDER, cocktail: PLACEHOLDER },
  { restaurant: "District", mixologist: PLACEHOLDER, cocktail: PLACEHOLDER },
  { restaurant: "Fluid 510", mixologist: PLACEHOLDER, cocktail: PLACEHOLDER },
  { restaurant: "Jaji", mixologist: PLACEHOLDER, cocktail: PLACEHOLDER },
  { restaurant: "Lucy Blue", mixologist: PLACEHOLDER, cocktail: PLACEHOLDER },
  { restaurant: "Moonglow", mixologist: PLACEHOLDER, cocktail: PLACEHOLDER },
  { restaurant: "North Light", mixologist: PLACEHOLDER, cocktail: PLACEHOLDER },
  { restaurant: "Popoca", mixologist: PLACEHOLDER, cocktail: PLACEHOLDER },
  { restaurant: "Sobre Mesa", mixologist: PLACEHOLDER, cocktail: PLACEHOLDER },
  { restaurant: "There There", mixologist: PLACEHOLDER, cocktail: PLACEHOLDER },
  {
    restaurant: "Town Bar & Lounge",
    mixologist: PLACEHOLDER,
    cocktail: PLACEHOLDER,
  },
  { restaurant: "Viridian", mixologist: PLACEHOLDER, cocktail: PLACEHOLDER },
];

router.get("/contest/cocktails", async (req, res) => {
  res.send(data);
});

router.get("/contest/votes", currentD4JUser, async (req, res) => {
  if (!req.currentD4JUser) {
    return res.send(null);
  }
  const userVote = await CocktailVote.findOne({
    year: CURRENT_YEAR,
    user: req.currentD4JUser.id,
  });
  res.send(userVote);
});

router.post("/contest/vote", currentD4JUser, async (req, res) => {
  const { barId }: { barId: string } = req.body;
  if (!req.currentD4JUser) {
    throw Error("No user signed in");
  }

  const existingVote = await CocktailVote.findOne({
    user: req.currentD4JUser.id,
    year: CURRENT_YEAR,
  });

  if (existingVote) {
    existingVote.bar = barId;
    await existingVote.save();
  } else {
    const newVote = new CocktailVote({
      user: req.currentD4JUser.id,
      bar: barId,
      year: CURRENT_YEAR,
    });
    await newVote.save();
  }

  res.send(null);
});

router.get("/contest/winner", async (req, res) => {
  const allVotes = await CocktailVote.find({ year: CURRENT_YEAR });
  const totals: Record<string, number> = allVotes.reduce(
    (voteObj, currentVote) => {
      if (voteObj[currentVote.bar]) {
        voteObj[currentVote.bar] += 1;
      } else {
        voteObj[currentVote.bar] = 1;
      }
      return voteObj;
    },
    {},
  );

  res.send(totals);
});

export default router;
