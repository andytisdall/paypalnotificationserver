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
  },
  {
    restaurant: "Agave Uptown",
    mixologist: "Everth Oliva",
  },
  { restaurant: "Co Nam", mixologist: "Trung Nguyen" },
  { restaurant: "District", mixologist: "John Marsh" },
  {
    restaurant: "Fluid 510",
    mixologist: "Sean Sullivan",
  },
  { restaurant: "Jaji", mixologist: "Sean Boultan" },
  {
    restaurant: "Lucy Blue",
    mixologist: "Joseph Cleveland",
  },
  {
    restaurant: "Moonglow",
    mixologist: "Samantha Junio",
  },
  { restaurant: "North Light", mixologist: "Sam Cho" },
  {
    restaurant: "Popoca",
    mixologist: "Stephanie Lopez",
  },
  {
    restaurant: "Sobre Mesa",
    mixologist: "Chef Nelson German",
  },
  {
    restaurant: "There There",
    mixologist: "Leila Malikyarm",
  },
  {
    restaurant: "Town Bar & Lounge",
    mixologist: "Kyle McDaniel",
  },
  { restaurant: "Viridian", mixologist: "William Tsui" },
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
