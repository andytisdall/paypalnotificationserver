const { Readable } = require('stream');

const { bucket } = require('../routes/db');

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
