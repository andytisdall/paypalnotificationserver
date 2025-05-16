import express from "express";
import path from "path";

import { bucket } from "../google/bucket";

const router = express.Router();

router.get("/images/:fileName", async (req, res) => {
  const { fileName } = req.params;

  const file = bucket.file(fileName);
  const outputStream = file.createReadStream();

  res.type(path.extname(fileName));
  outputStream.pipe(res);
});

export default router;
