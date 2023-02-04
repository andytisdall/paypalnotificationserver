const express = require('express');
const mongodb = require('mongodb');

const { bucket } = require('../services/fileStorage');

const router = express.Router();

router.get('/db/images/:fileName', async (req, res) => {
  const { fileName } = req.params;

  const [id, ext] = fileName.split('.');

  const mongoId = new mongodb.ObjectId(id);
  const stream = bucket.openDownloadStream(mongoId);
  res.type(ext);
  stream.pipe(res);
});

module.exports = router;
