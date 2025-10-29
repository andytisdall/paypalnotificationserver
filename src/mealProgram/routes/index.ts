import express from "express";

import cboRouter from "./cbo";
import campaignRouter from "./campaign";
import createMealsRouter from "./createMeals";
import surveyRouter from "./survey";
import doorfrontMealsRouter from "./doorfront/meals";
import doorfrontClientRouter from "./doorfront/client";

import workforceRouter from "./workforce";

const router = express.Router({ mergeParams: true });

router.use(cboRouter);
router.use(campaignRouter);
router.use(createMealsRouter);
router.use(surveyRouter);
router.use(doorfrontMealsRouter);
router.use(doorfrontClientRouter);
router.use(workforceRouter);

export default router;
