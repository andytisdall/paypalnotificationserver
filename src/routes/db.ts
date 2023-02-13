import express from 'express';
import stream from 'stream';
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const bucket = storage.bucket('coherent-vision-368820.appspot.com');

const dbRouter = express.Router();

export const uploadFile = ({ data, name }: { data: Buffer; name: string }) => {
  const file = bucket.file(name);
  const passthroughStream = new stream.PassThrough();
  passthroughStream.write(data);
  passthroughStream.end();
  passthroughStream.pipe(file.createWriteStream());

  return new Promise((resolve, reject) => {
    passthroughStream.on('error', (err) => {
      reject(err);
    });
    passthroughStream.on('finish', () => resolve(name));
  });
};

dbRouter.get('/db/images/:fileName', async (req, res) => {
  const { fileName } = req.params;

  // const ext = fileName.split('.')[1];

  const file = bucket.file(fileName);
  const outputStream = file.createReadStream();

  // res.type(ext);
  outputStream.pipe(res);
});

export default dbRouter;
