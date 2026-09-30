import express from "express";
import mongoose from "mongoose";

import { currentD4JUser } from "../../middlewares/current-d4j-user";
import { ContestVote, MixologyData } from "@community-kitchens/apiinterfaces";

const CURRENT_YEAR = 2026;

const CocktailVote = mongoose.model("CocktailVote");

const router = express.Router();

const data: MixologyData[] = [
  {
    restaurant: "Acre Kitchen & Bar",
    mixologist: "Gina Ingeri",
    cocktail: "Placeholder Title",
  },
  {
    restaurant: "Agave Uptown",
    mixologist: "Everth Oliva",
    cocktail: "Placeholder Title",
  },
  {
    restaurant: "Co Nam",
    mixologist: "Trung Nguyen",
    cocktail: "Placeholder Title",
  },
  {
    restaurant: "District",
    mixologist: "John Marsh",
    cocktail: "Placeholder Title",
  },
  {
    restaurant: "Fluid 510",
    mixologist: "Sean Sullivan",
    cocktail: "Placeholder Title",
  },
  {
    restaurant: "Jaji",
    mixologist: "Sean Boultan",
    cocktail: "Placeholder Title",
  },
  {
    restaurant: "Lucy Blue",
    mixologist: "Joseph Cleveland",
    cocktail: "Placeholder Title",
  },
  {
    restaurant: "Moonglow",
    mixologist: "Samantha Junio",
    cocktail: "Placeholder Title",
  },
  {
    restaurant: "North Light",
    mixologist: "Sam Cho",
    cocktail: "Placeholder Title",
  },
  {
    restaurant: "Popoca",
    mixologist: "Stephanie Lopez",
    cocktail: "Placeholder Title",
  },
  {
    restaurant: "Sobre Mesa",
    mixologist: "Chef Nelson German Chef Nelson German",
    cocktail: "Placeholder Title Placeholder Title DSAD",
  },
  {
    restaurant: "There There",
    mixologist: "Leila Malikyarm",
    cocktail: "Placeholder Title",
  },
  {
    restaurant: "Town Bar & Lounge",
    mixologist: "Kyle McDaniel",
    cocktail: "Placeholder Title",
  },
  {
    restaurant: "Viridian",
    mixologist: "William Tsui",
    cocktail: "Placeholder Title",
  },
];

router.get("/contest/cocktails", async (req, res) => {
  res.send(data);
});

router.get("/contest/votes", currentD4JUser, async (req, res) => {
  if (!req.currentD4JUser) {
    return res.send(null);
  }
  const userVote: ContestVote | null = await CocktailVote.findOne({
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

  const voteTotals: Record<string, number> = {};
  data.forEach((item) => (voteTotals[item.restaurant] = 0));
  allVotes.forEach((currentVote) => {
    voteTotals[currentVote.bar] += 1;
  });

  res.send(voteTotals);
});

export default router;
