import express from 'express';

import deleteHoursRouter from './deleteHours';
import interestFormRouter from './interestForm';
import getHoursRouter from './getHours';
import volunteerContactRouter from './volunteerContact';
import createHoursRouter from './createHours';
import getCampaignsRouter from './getCampaigns';

const volunteerRouter = express.Router({ mergeParams: true });

volunteerRouter.use(deleteHoursRouter);
volunteerRouter.use(interestFormRouter);
volunteerRouter.use(getHoursRouter);
volunteerRouter.use(createHoursRouter);
volunteerRouter.use(getCampaignsRouter);
volunteerRouter.use(volunteerContactRouter);

export default volunteerRouter;
