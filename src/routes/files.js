const express = require('express');

const { getAccountForFileUpload } = require('../services/getModel');
const { currentUser } = require('../middlewares/current-user');
const { requireAuth } = require('../middlewares/require-auth');
const { uploadFiles } = require('../services/uploadFiles');

const router = express.Router();

router.post(
  '/files/:accountType',
  currentUser,
  requireAuth,
  async (req, res) => {
    const { expiration, accountId } = req.body;
    const { accountType } = req.params;

    const fileList = [];
    for (entry in req.files) {
      fileList.push({ docType: entry, file: req.files[entry] });
    }

    const account = await getAccountForFileUpload(accountType, accountId);
    // make api call to salesforce
    const filesAdded = await uploadFiles(account, fileList, expiration);

    res.send({ filesAdded });
  }
);

module.exports = router;
