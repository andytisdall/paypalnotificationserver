const express = require('express');
const mongodb = require('mongodb');
const mongoose = require('mongoose');

const { bucket } = require('../services/fileStorage');

const router = express.Router();

router.get('/db/images/:fileName', async (req, res) => {
  const { fileName } = req.params;

  const [id, ext] = fileName.split('.');

  const mongoId = new mongodb.ObjectId(id);
  if (!bucket) {
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'images',
    });
  }
  const stream = bucket.openDownloadStream(mongoId);
  res.type(ext);
  stream.pipe(res);
});

module.exports = router;
