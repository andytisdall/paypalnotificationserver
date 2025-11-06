import express from "express";
import mongoose from "mongoose";

import { currentUser } from "../../../middlewares/current-user";
import { requireAuth } from "../../../middlewares/require-auth";
import { updateContact } from "../../../utils/salesforce/SFQuery/contact/contact";

const User = mongoose.model("User");
const router = express.Router();

router.patch("/", currentUser, requireAuth, async (req, res) => {
  const { userId, username, password, salesforceId, busDriver } = req.body;

  if (!username && !password) {
    res.status(400);
    throw new Error("No username or password provided");
  }

  const u = await User.findById(userId);
  if (!u) {
    throw Error("User not found");
  }

  if (u.id !== req.currentUser!.id && !req.currentUser!.admin) {
    throw new Error("User not authorized to modify this user");
  }

  if (u.id !== req.currentUser!.id && u.admin) {
    throw new Error("Admin users can only be modified by themselves");
  }

  if (username && username !== u.username) {
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw Error("Username is already in use!");
    }
    u.username = username;
  }
  if (password) {
    u.password = password;
  }
  if (salesforceId) {
    u.salesforceId = salesforceId;
    await updateContact(u.salesforceId, { Portal_Username__c: u.username });
  }

  if (password) {
    if (u.salesforceId) {
      await updateContact(u.salesforceId, {
        Portal_Temporary_Password__c: "",
      });
    }
    if (!u.active && u.id === req.currentUser!.id) {
      u.active = true;
    }
  }

  u.busDriver = busDriver;

  await u.save();
  res.send(u);
});

export default router;
