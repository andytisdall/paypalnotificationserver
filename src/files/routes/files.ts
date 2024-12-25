import express from 'express';
import path from 'path';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { uploadFiles } from '../salesforce/uploadToSalesforce';
import { DocType, FileWithType } from '../salesforce/metadata';
import { AccountType } from '../salesforce/getModel';
import { bucket } from '../google/bucket';
import { getContactById } from '../../utils/salesforce/SFQuery/contact';
import homeChefUpdate from '../salesforce/homeChefUpdate';

const router = express.Router();

router.get('/images/:fileName', async (req, res) => {
  const { fileName } = req.params;

  const file = bucket.file(fileName);
  const outputStream = file.createReadStream();

  res.type(path.extname(fileName));
  outputStream.pipe(res);
});

router.post('/', currentUser, requireAuth, async (req, res) => {
  const fileList: FileWithType[] = [];
  for (let entry in req.files) {
    if (!Array.isArray(req.files[entry])) {
      //@ts-ignore
      fileList.push({ docType: entry as DocType, file: req.files[entry] });
    }
  }

  // make api call to salesforce

  const contact = await getContactById(req.currentUser?.salesforceId!);
  if (!contact) {
    throw Error('Could not get contact');
  }

  const docs = fileList.map((f) => f.docType);

  const filesAdded = await uploadFiles(contact, fileList);
  await homeChefUpdate(docs, contact);

  res.send(filesAdded);
});

export default router;
