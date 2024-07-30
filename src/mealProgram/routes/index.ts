import express from 'express';

import restaurantRouter from './restaurant';
import scheduleRouter from './schedule';
import formsRouter from './forms';
import cboRouter from './cbo';
import campaignRouter from './campaign';
import createMealsRouter from './createMeals';

const router = express.Router({ mergeParams: true });

router.use(restaurantRouter);
router.use(scheduleRouter);
router.use(formsRouter);
router.use(cboRouter);
router.use(campaignRouter);
router.use(createMealsRouter);

export default router;
