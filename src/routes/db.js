const express = require('express');
const mongoose = require('mongoose');
const mongodb = require('mongodb');

const dbRouter = express.Router();

let bucket;

mongoose.connection.on('connected', () => {
  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'images',
  });
});

dbRouter.get('/db/images/:fileName', async (req, res) => {
  const { fileName } = req.params;

  const [id, ext] = fileName.split('.');

  const mongoId = new mongodb.ObjectId(id);
  const stream = bucket.openDownloadStream(mongoId);

  res.type(ext);
  stream.pipe(res);
});

module.exports = { dbRouter, bucket };
