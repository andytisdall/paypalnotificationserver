const express = require('express');

const router = express.Router();

router.post('/meal-survey', async (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

router.post('/signup-survey', async (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

module.exports = router;
