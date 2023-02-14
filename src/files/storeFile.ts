import stream from 'stream';

import { bucket } from './bucket';

export const storeFile = ({ data, name }: { data: Buffer; name: string }) => {
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
