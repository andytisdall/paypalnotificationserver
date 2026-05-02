import { UploadedFile } from "express-fileupload";
import { createHash } from "crypto";
import { format } from "date-fns";

import { storeFile } from "../utils/googleApis/files/storeFile";

export const savePhoto = async (
  file: UploadedFile | UploadedFile[],
  hashSeed: string = "default",
) => {
  let photoArray: UploadedFile[] = [];
  if (Array.isArray(file)) {
    photoArray = file;
  } else {
    photoArray = [file];
  }

  const photoUrlPromises = photoArray.map(async (photoFile, i) => {
    const hash = createHash("md5").update(hashSeed).digest("hex");

    const fileName =
      "outgoing-text-" +
      format(new Date(), "yyyy-MM-dd-hh-mm-ss-a") +
      `-${hash}-${i}`;

    return await storeFile({
      file: photoFile,
      name: fileName,
      jpg: photoFile.mimetype === "image/jpeg",
    });
  });

  return await Promise.all(photoUrlPromises);
};
