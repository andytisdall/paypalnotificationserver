import express from 'express';
import mongoose from 'mongoose';

const User = mongoose.model('User');

const router = express.Router();

router.get('/user', async (req, res) => {
  const user = {
    id: '1',
    username: 'Andy',
  };
  res.send(user);
});

export default router;
