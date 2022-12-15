const express = require('express');

const { Restaurant } = require('../models/restaurant');
const { User } = require('../models/user');
const { currentUser } = require('../middlewares/current-user');
const { requireAuth } = require('../middlewares/require-auth');
const { uploadFiles } = require('../services/uploadFiles');

const router = express.Router();

router.post('/files', currentUser, requireAuth, async (req, res) => {
  const { expiration } = req.body;
  const restaurant = await Restaurant.findById(req.body.restaurant);
  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  const fileList = [];
  for (entry in req.files) {
    fileList.push({ docType: entry, file: req.files[entry] });
  }

  // make api call to salesforce
  const dataAdded = await uploadFiles(restaurant, fileList, expiration);

  res.send({ dataAdded });
});

module.exports = router;
