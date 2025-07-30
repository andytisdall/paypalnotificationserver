import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { currentUser } from "../../../middlewares/current-user";
import { requireAuth } from "../../../middlewares/require-auth";
import { requireAdmin } from "../../../middlewares/require-admin";
import getSecrets from "../../../utils/getSecrets";
import { Password } from "../../password";

const User = mongoose.model("User");

const router = express.Router();

router.post("/signin", async (req, res) => {
  const { JWT_KEY } = await getSecrets(["JWT_KEY"]);
  if (!JWT_KEY) {
    throw Error("No JWT key found");
  }

  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });
  if (!existingUser) {
    res.status(401);
    throw new Error("Credentials Invalid");
  }

  const passwordsMatch = await Password.compare(
    existingUser.password,
    password
  );

  if (!passwordsMatch) {
    res.status(401);
    throw new Error("Credentials Invalid");
  }

  if (!existingUser.active) {
    existingUser.active = true;
    await existingUser.save();
  }

  const token = jwt.sign(
    {
      id: existingUser.id,
    },
    JWT_KEY
  );

  res.send({ user: existingUser, token });
});

router.post(
  "/admin-signin",
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { userId }: { userId: string } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      throw Error("User not found");
    }

    if (user.admin && req.currentUser?.username !== "Andy") {
      throw Error("Cannot log in as admin");
    }

    const { JWT_KEY } = await getSecrets(["JWT_KEY"]);
    if (!JWT_KEY) {
      throw Error("No JWT key found");
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      JWT_KEY
    );

    res.send({ user, token });
  }
);

export default router;
