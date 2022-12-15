const express = require('express');

const { User } = require('../models/user');
const { currentUser } = require('../middlewares/current-user.js');
const { requireAuth } = require('../middlewares/require-auth');
const { requireAdmin } = require('../middlewares/require-admin');

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
    const { username, password } = req.body;

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).send('Username is in use');
    }

    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).send(newUser);
  }
);

module.exports = router;
