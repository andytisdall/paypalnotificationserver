import stream from 'stream';
import path from 'path';
import convert from 'heic-convert';
import Jimp from 'jimp';
import jpegAutorotate from 'jpeg-autorotate';

import { bucket } from './bucket';

const validFileExtensions = ['.jpg', '.jpeg', '.png', '.heic'];

const convertFile = async (data: Buffer) => {
  const outputBuffer = await convert({
    buffer: data,
    format: 'JPEG',
    quality: 0.2,
  });
  return Buffer.from(outputBuffer);
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
  // console.log(extension);

  if (!validFileExtensions.includes(extension.toLowerCase())) {
    throw Error('File must be JPG, PNG or HEIC');
  }
  let data: Buffer = file.data;
  if (extension.toLowerCase() === '.heic') {
    console.log('heic conversion start');
    data = await convertFile(file.data);
    console.log('heic conversion successful');

    extension = '.jpeg';
  }

  let buffer = data;
  try {
    const rotatedImage = await jpegAutorotate.rotate(data, { quality: 25 });
    buffer = rotatedImage.buffer;
  } catch (err) {}
  console.log('image compression start');

  const compressedImage = (await Jimp.read(buffer)).quality(25);
  const compressedBuffer = await compressedImage.getBufferAsync(
    compressedImage.getMIME()
  );
  console.log('image compression successful');

  const fileName = name + extension;

  const storedFile = bucket.file(fileName);

  const passthroughStream = new stream.PassThrough();
  passthroughStream.write(compressedBuffer);
  passthroughStream.end();

  const googleStorageStream = storedFile.createWriteStream();

  passthroughStream.pipe(googleStorageStream);

  // storedFile.addListener

  return new Promise((resolve, reject) => {
    googleStorageStream.on('error', (err) => {
      reject(err);
    });
    googleStorageStream.on('finish', () => {
      resolve(storedFile.publicUrl());
    });
  });
};
