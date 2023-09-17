import express from 'express';

const router = express.Router();

router.get('/user', async (req, res) => {
  const user = {
    id: '1',
    username: 'Andy',
  };
  res.send(user);
});

export default router;
