import express from 'express';
import mongoose from 'mongoose';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { requireAdmin } from '../../middlewares/require-admin';

const User = mongoose.model('User');
const router = express.Router();

router.get('/user', currentUser, async (req, res) => {
  if (!req.currentUser) {
    return res.send(null);
  }

  res.send(req.currentUser);
});

router.get(
  '/user/all',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const allUsers = await User.find();
    res.send(allUsers);
  }
);

router.post(
  '/user',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { username, password, salesforceId } = req.body;

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).send('Username is in use');
    }

    const newUser = new User({ username, password, salesforceId });
    await newUser.save();
    res.status(201).send(newUser);
  }
);

router.patch('/user', currentUser, requireAuth, async (req, res) => {
  const { userId, username, password, salesforceId, householdId } = req.body;

  if (!username && !password) {
    res.status(400);
    throw new Error('No username or password provided');
  }

  const u = await User.findById(userId);
  if (!u) {
    throw Error('User not found');
  }

  if (u.id !== req.currentUser!.id && !req.currentUser!.admin) {
    res.status(403);
    throw new Error('User not authorized to modify this user');
  }

  if (u.id !== req.currentUser!.id && u.admin) {
    res.status(403);
    throw new Error('Admin users can only be modified by themselves');
  }

  if (username && username !== u.username) {
    u.username = username;
  }
  if (password) {
    u.password = password;
  }
  if (salesforceId) {
    u.salesforceId = salesforceId;
  }
  if (u.id === req.currentUser!.id && !u.active) {
    u.active = true;
  }

  await u.save();
  res.send(u);
});

router.delete(
  '/user/:userId',
  currentUser,
  requireAuth,
  requireAdmin,
  async (req, res) => {
    await User.deleteOne({ _id: req.params.userId });
    res.sendStatus(204);
  }
);

export default router;
