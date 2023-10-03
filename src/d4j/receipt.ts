import express from 'express';

import { uploadFileToSalesforce } from '../utils/salesforce/SFQuery/fileUpload';

const router = express.Router();

router.post('/receipt', async (req, res) => {
  const { id }: { id: string; name: string } = req.body;
  const data = { title: 'test', description: 'test', folder: 'test' };
  if (req.files?.receipt && !Array.isArray(req.files.receipt)) {
    await uploadFileToSalesforce(data, req.files.receipt, id);
  }
  res.send(204);
});

export default router;
