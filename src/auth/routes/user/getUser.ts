import express from "express";
import mongoose from "mongoose";

import { currentUser } from "../../../middlewares/current-user";
import { requireAuth } from "../../../middlewares/require-auth";
import { requireAdmin } from "../../../middlewares/require-admin";

const User = mongoose.model("User");
const router = express.Router();

router.get("/", currentUser, async (req, res) => {
  if (!req.currentUser) {
    return res.sendStatus(204);
  }

  res.send(req.currentUser);
});

router.get("/all", currentUser, requireAuth, requireAdmin, async (req, res) => {
  const allUsers = await User.find();
  res.send(allUsers);
});

export default router;
