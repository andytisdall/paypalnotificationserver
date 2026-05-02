import express from "express";
import mongoose from "mongoose";
import { requireAdmin } from "../../middlewares/require-admin";

const RSVP = mongoose.model("RSVP");

const router = express.Router();

router.post("/rsvp", async (req, res) => {
  const {
    name,
    email,
    numberOfPeople,
    numberOfAdditional,
    additional,
  }: {
    name: string;
    email: string;
    numberOfPeople: string;
    additional: boolean;
    numberOfAdditional: boolean;
  } = req.body;

  const rsvp = new RSVP({
    name,
    email,
    numberOfPeople,
    additional,
    numberOfAdditional,
  });

  await rsvp.save();

  res.send(null);
});

router.get("/rsvp", requireAdmin, async (req, res) => {
  const rsvps = await RSVP.find();
  res.send(rsvps);
});

export default router;
