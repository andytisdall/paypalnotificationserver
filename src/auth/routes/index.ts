import express from 'express';

import userRouter from './user';
import authRouter from './auth';

const router = express.Router({ mergeParams: true });

router.use('/user', userRouter);
router.use(authRouter);

export default router;
