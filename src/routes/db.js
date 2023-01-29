const express = require('express');

const { getFile } = require('../services/fileStorage');

const router = express.Router();

router.get('/db/images/:id', async (req, res) => {
  const { id } = req.params;

  const stream = getFile(id.split('.')[0]);
  stream.pipe(res);
});

module.exports = router;
