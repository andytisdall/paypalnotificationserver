import express from 'express';

import receiptRouter from './receipt';
import restaurantRouter from './restaurant';
import userRouter from './user';

const d4jRouter = express.Router({ mergeParams: true });

d4jRouter.use(restaurantRouter);

export default d4jRouter;
