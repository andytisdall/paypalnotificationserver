import express from 'express';

const router = express.Router();

type RewardsPostBody = {
  restaurant: string;
  email: string;
  firstName?: string;
  lastName: string;
};

router.post('/rewards', async (req, res) => {
  if (!req.files?.photo) {
    throw Error('Photo required');
  }
  if (!Array.isArray(req.files.photo)) {
    throw Error('Only one photo required');
  }
});

export default router;
