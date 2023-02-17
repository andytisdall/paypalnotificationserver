import stream from 'stream';
import path from 'path';
import convert from 'heic-convert';

import { bucket } from './bucket';

const validFileExtensions = ['.jpg', '.jpeg', '.png', '.heic'];

const convertFile = async (data: Buffer) => {
  const outputBuffer = await convert({
    buffer: data,
    format: 'JPEG',
    quality: 0.2,
  });
  return outputBuffer;
};

export const deleteFile = async (name: string) => {
  const file = bucket.file(name);
  await file.delete();
};

export const storeFile = async ({
  file,
  name,
}: {
  file: { data: Buffer; name: string };
  name: string;
}): Promise<string> => {
  let extension = path.extname(file.name);
  let data: Buffer | ArrayBuffer = file.data;
  if (!validFileExtensions.includes(extension.toLowerCase())) {
    throw Error('File must be JPG, PNG or HEIC');
  }
  // convert
  if (extension.toLowerCase() === '.heic') {
    data = await convertFile(file.data);
    extension = '.jpeg';
  }
  const fileName = name + extension;
  const storedFile = bucket.file(name + extension);
  const passthroughStream = new stream.PassThrough();
  passthroughStream.write(data);
  passthroughStream.end();
  passthroughStream.pipe(storedFile.createWriteStream());

  return new Promise((resolve, reject) => {
    passthroughStream.on('error', (err) => {
      reject(err);
    });
    passthroughStream.on('finish', () => resolve(fileName));
  });
};
