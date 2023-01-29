const mongoose = require('mongoose');
const mongodb = require('mongodb');
const { Readable } = require('stream');

let bucket;

mongoose.connection.on('connected', () => {
  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'images',
  });
  console.log('file storage bucket connected');
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

const getFile = (id) => {
  const mongoId = new mongodb.ObjectId(id);
  return bucket.openDownloadStream(mongoId);
};

module.exports = { uploadFile, getFile };
