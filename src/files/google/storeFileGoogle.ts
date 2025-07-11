import stream from "stream";
import sharp from "sharp";

import { bucket } from "./bucket";
import { sendEmail } from "../../utils/email/email";

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
  try {
    const buffer = await sharp(file.data)
      .withMetadata()
      .jpeg({ quality: 30 })
      .toBuffer();

    const storedFile = bucket.file(name + ".jpg");

    const passthroughStream = new stream.PassThrough();
    passthroughStream.write(buffer);
    passthroughStream.end();

    const googleStorageStream = storedFile.createWriteStream();

    passthroughStream.pipe(googleStorageStream);

    return new Promise((resolve, reject) => {
      googleStorageStream.on("error", (err) => {
        reject(err);
      });
      googleStorageStream.on("finish", () => {
        resolve(storedFile.publicUrl());
      });
    });
  } catch (err) {
    await sendEmail({
      to: "andy@ckoakland.org",
      from: "andy@ckoakland.org",
      html: JSON.stringify(err),
      subject: "Error when saving image file",
    });
    return "";
  }
};
