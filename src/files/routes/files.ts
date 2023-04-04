import express from 'express';
import path from 'path';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { uploadFiles, DocType, FileList } from '../uploadFilesToSalesforce';
import { AccountType, Account, getAccountForFileUpload } from '../getModel';
import { bucket } from '../bucket';

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
    accountId,
    accountType,
    expiration,
  }: { accountId: string; accountType: AccountType; expiration?: string } =
    req.body;
  const fileList: FileList = [];
  for (let entry in req.files) {
    if (!Array.isArray(req.files[entry])) {
      //@ts-ignore
      fileList.push({ docType: entry as DocType, file: req.files[entry] });
    }
  }

  // make api call to salesforce

  const account: Account | undefined = await getAccountForFileUpload(
    accountType,
    accountId
  );
  if (!account) {
    throw Error('Could not get account');
  }

  const filesAdded = await uploadFiles(account, fileList, expiration);

  res.send({ filesAdded });
});

export default router;
