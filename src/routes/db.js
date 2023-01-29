const express = require('express');

const { getFile } = require('../services/fileStorage');

const router = express.Router();

router.get('/db/images/:file', async (req, res) => {
  const { file } = req.params;

  const [id, ext] = file.split('.');

  const stream = getFile(id);
  res.type(ext);
  stream.pipe(res);
});

module.exports = router;
