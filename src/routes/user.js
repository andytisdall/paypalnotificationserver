const express = require('express');
const { currentUser } = require('../middlewares/current-user.js');

const router = express.Router();

router.get('/user', currentUser, async (req, res) => {
  if (!req.currentUser) {
    return res.send(null);
  }

  res.send(req.currentUser);
});

module.exports = router;
