const express = require('express');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const { Readable } = require('stream');

const dbRouter = express.Router();

let bucket;

mongoose.connection.on('connected', () => {
  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'images',
  });
});


const uploadFile = ({ data, name }) => {
  const stream = bucket.openUploadStream(name);
  const readableStream = new Readable();
  readableStream.push(data);
  readableStream.push(null);
  readableStream.pipe(stream);

  return new Promise((resolve, reject) => {
    stream.on('error', (err) => {
      reject(err);
    });
    stream.on('finish', () => resolve(stream.id));
  });
};

module.exports = { uploadFile };


dbRouter.get('/db/images/:fileName', async (req, res) => {
  const { fileName } = req.params;

  const [id, ext] = fileName.split('.');

  const mongoId = new mongodb.ObjectId(id);
  const stream = bucket.openDownloadStream(mongoId);

  res.type(ext);
  stream.pipe(res);
});

module.exports = { dbRouter, uploadFile };
