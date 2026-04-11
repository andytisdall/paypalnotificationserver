import { Storage } from "@google-cloud/storage";

import urls from "../../urls";

const storage = new Storage();
export const bucket = storage.bucket(urls.fileBucket);
