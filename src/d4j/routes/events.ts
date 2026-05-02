import express from "express";
import mongoose from "mongoose";

import { getD4JCampaigns } from "../../utils/salesforce/volunteer/campaign/campaign";

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
