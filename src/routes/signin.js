const express = require('express');

const getSecrets = require('../services/getSecrets.js');
const { Password } = require('../services/password.js');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user.js');

const router = express.Router();

router.post('/signin', async (req, res) => {
  const { JWT_KEY } = await getSecrets(['JWT_KEY']);

  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });
  if (!existingUser) {
    res.status(401);
    return res.send('Credentials Invalid');
  }

  const passwordsMatch = await Password.compare(
    existingUser.password,
    password
  );

  if (!passwordsMatch) {
    res.status(401);
    return res.send('Credentials Invalid');
  }

  const token = jwt.sign(
    {
      id: existingUser.id,
    },
    JWT_KEY
  );

  res.send({ user: existingUser, token });
});

module.exports = router;
