const express = require('express');

const { getFile } = require('../services/fileStorage');

const router = express.Router();

router.get('/db/images/:fileName', async (req, res) => {
  const { fileName } = req.params;

  const [id, ext] = fileName.split('.');

  const stream = getFile(id);
  res.type(ext);
  stream.pipe(res);
});

module.exports = router;
