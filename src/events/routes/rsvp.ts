import express from "express";
import mongoose from "mongoose";

import { requireAdmin } from "../../middlewares/require-admin";

const RSVP = mongoose.model("RSVP");

const router = express.Router();

router.post("/rsvp", async (req, res) => {
  const rsvp: {
    name: string;
    email: string;
    numberOfPeople: string;
    additional: boolean;
    numberOfAdditional: boolean;
  } = req.body;

  const newRsvp = new RSVP(rsvp);

  await newRsvp.save();

  res.send(null);
});

router.get("/rsvp", requireAdmin, async (req, res) => {
  const rsvps = await RSVP.find();
  res.send(rsvps);
});

router.patch("/rsvp", requireAdmin, async (req, res) => {
  const rsvp = req.body;

  await RSVP.updateOne({ _id: rsvp.id }, rsvp);

  res.send(null);
});

router.delete("/rsvp/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;

  await RSVP.deleteOne({ _id: id });

  res.send(null);
});

export default router;
