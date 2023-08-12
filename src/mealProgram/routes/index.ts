import express from 'express';

import restaurantRouter from './restaurant';
import scheduleRouter from './schedule';
import formsRouter from './forms';

const router = express.Router({ mergeParams: true });

router.use(restaurantRouter);
router.use(scheduleRouter);
router.use(formsRouter);

export default router;
