import express from "express";

import formsRouter from "./forms";
import cboRouter from "./cbo";
import campaignRouter from "./campaign";
import createMealsRouter from "./createMeals";
import surveyRouter from "./survey";
import doorfrontRouter from "./doorfront";
import workforceRouter from "./workforce";

const router = express.Router({ mergeParams: true });

router.use(formsRouter);
router.use(cboRouter);
router.use(campaignRouter);
router.use(createMealsRouter);
router.use(surveyRouter);
router.use(doorfrontRouter);
router.use(workforceRouter);

export default router;
