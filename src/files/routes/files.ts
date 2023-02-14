import express from 'express';

import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import { uploadFiles, DocType, FileList } from '../uploadFilesToSalesforce';
import { AccountType } from '../getModel';
import { bucket } from '../bucket';

const router = express.Router();

router.get('/images/:fileName', async (req, res) => {
  const { fileName } = req.params;

  // const ext = fileName.split('.')[1];

  const file = bucket.file(fileName);
  const outputStream = file.createReadStream();

  // res.type(ext);
  outputStream.pipe(res);
});

router.post('/', currentUser, requireAuth, async (req, res) => {
  const {
    expiration,
    accountId,
    accountType,
  }: { expiration?: string; accountId: string; accountType: AccountType } =
    req.body;
  const fileList: FileList = [];
  for (let entry in req.files) {
    if (!Array.isArray(req.files[entry])) {
      //@ts-ignore
      fileList.push({ docType: entry as DocType, file: req.files[entry] });
    }
  }

  // make api call to salesforce

  const filesAdded = await uploadFiles(
    accountId,
    fileList,
    accountType,
    expiration
  );

  res.send({ filesAdded });
});

export default router;
