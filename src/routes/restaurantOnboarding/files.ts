import express from 'express';

import { getAccountForFileUpload } from '../../services/getModel';
import { currentUser } from '../../middlewares/current-user';
import { requireAuth } from '../../middlewares/require-auth';
import {
  uploadFiles,
  updateRestaurant,
  DocType,
  FileList,
} from '../../services/salesforce/uploadFiles';
import { AccountType } from '../../services/getModel';

const router = express.Router();

router.post('/files', currentUser, requireAuth, async (req, res) => {
  const {
    expiration,
    accountId,
    accountType,
  }: { expiration: string; accountId: string; accountType: AccountType } =
    req.body;
  const fileList: FileList = [];
  for (let entry in req.files) {
    if (!Array.isArray(req.files[entry])) {
      //@ts-ignore
      fileList.push({ docType: entry as DocType, file: req.files[entry] });
    }
  }

  const account = await getAccountForFileUpload(accountType, accountId);
  if (!account) {
    throw Error('Could not get account');
  }
  // make api call to salesforce
  if (accountType === 'restaurant') {
    await updateRestaurant(account.salesforceId, fileList, expiration);
  }
  await uploadFiles(account, fileList);

  res.send({ numberOfFilesUploaded: fileList.length });
});

export default router;
