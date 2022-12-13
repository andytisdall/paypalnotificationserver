const express = require('express');

const { Restaurant } = require('../models/restaurant');
const { User } = require('../models/user');
const { currentUser } = require('../middlewares/current-user');
const { requireAuth } = require('../middlewares/require-auth');
const { uploadFiles } = require('../services/uploadFiles');

const router = express.Router();

router.post('/files', currentUser, requireAuth, async (req, res) => {
  const restaurant = await Restaurant.findById(req.body.restaurant);
  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }
  const fileList = [];
  for (file in req.files) {
    fileList.push({ name: file, data: req.files[file].data });
  }
  uploadFiles(restaurant, fileList);

  // make api call to salesforce
});

module.exports = router;
