import express from 'express';

import restaurantRouter from './restaurant';
import scheduleRouter from './schedule';

const router = express.Router({ mergeParams: true });

router.use(restaurantRouter);
router.use(scheduleRouter);

export default router;
