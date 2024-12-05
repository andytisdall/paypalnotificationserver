import express from 'express';
import path from 'path';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { uploadFiles } from '../salesforce/uploadToSalesforce';
import { DocType, FileWithType } from '../salesforce/metadata';
import {
  AccountType,
  Account,
  getAccountForFileUpload,
} from '../salesforce/getModel';
import { bucket } from '../google/bucket';
import { getContactById } from '../../utils/salesforce/SFQuery/contact';

const router = express.Router();

router.get('/images/:fileName', async (req, res) => {
  const { fileName } = req.params;

  const file = bucket.file(fileName);
  const outputStream = file.createReadStream();

  res.type(path.extname(fileName));
  outputStream.pipe(res);
});

router.post('/', currentUser, requireAuth, async (req, res) => {
  const {
    accountType,
    expiration,
  }: { accountId: string; accountType: AccountType; expiration?: string } =
    req.body;
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

  const filesAdded = await uploadFiles(contact, fileList);

  res.send(filesAdded);
});

export default router;
