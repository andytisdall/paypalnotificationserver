import express from "express";
import mongoose from "mongoose";

import { getD4JCampaigns } from "../../utils/salesforce/SFQuery/volunteer/campaign/campaign";
import { currentD4JUser } from "../../middlewares/current-d4j-user";
import { currentUser } from "../../middlewares/current-user";
import { requireAuth } from "../../middlewares/require-auth";
import { requireAdmin } from "../../middlewares/require-admin";
// import { getAccountById } from '../../utils/salesforce/SFQuery/account/account';

const CocktailVote = mongoose.model("CocktailVote");

const router = express.Router();

const COCKTAIL_PARTICIPANT_IDS: string[] = [];

router.get("/events", async (req, res) => {
  const events = await getD4JCampaigns();

  res.send(events);
});

router.get("/events/cocktail-competition", async (req, res) => {
  res.send(COCKTAIL_PARTICIPANT_IDS);
});

export default router;
