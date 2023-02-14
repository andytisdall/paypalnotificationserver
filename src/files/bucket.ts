import { Storage } from '@google-cloud/storage';

const storage = new Storage();
export const bucket = storage.bucket('coherent-vision-368820.appspot.com');
