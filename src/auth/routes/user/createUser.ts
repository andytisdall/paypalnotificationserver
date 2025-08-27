import express from "express";
import mongoose from "mongoose";
import passwordGenerator from "generate-password";

import { currentUser } from "../../../middlewares/current-user";
import { requireAuth } from "../../../middlewares/require-auth";
import { requireAdmin } from "../../../middlewares/require-admin";

const User = mongoose.model("User");
const router = express.Router();

router.post("/", currentUser, requireAuth, requireAdmin, async (req, res) => {
  const { username, password, salesforceId } = req.body;

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw Error("Username is in use");
  }

  const newUser = await createPortalUser({ username, password, salesforceId });
  res.status(201).send(newUser);
});

export const getUniqueUsernameAndPassword = async ({
  firstName,
  lastName,
}: {
  firstName?: string;
  lastName: string;
}) => {
  const temporaryPassword = passwordGenerator.generate({
    length: 10,
    numbers: true,
  });

  const username = (
    (firstName?.charAt(0).toLowerCase() || "") + lastName.toLowerCase()
  ).replace(" ", "");

  let uniqueUsername = username;
  let existingUsername = await User.findOne({ username });
  let i = 1;
  while (existingUsername) {
    uniqueUsername = username + i;
    existingUsername = await User.findOne({ username: uniqueUsername });
    i++;
  }

  return { username: uniqueUsername, password: temporaryPassword };
};

export const createPortalUser = async ({
  username,
  password,
  salesforceId,
}: {
  username: string;
  password: string;
  salesforceId: string;
}) => {
  const newUser = new User({
    username,
    password,
    salesforceId,
  });
  await newUser.save();
  return newUser;
};

export default router;
