import express from 'express';

import deleteHoursRouter from './deleteHours';
import interestFormRouter from './interestForm';
import getHoursRouter from './getHours';
import ckKitchenRouter from './ckKitchen';
import createHoursRouter from './createHours';
import getCampaignsRouter from './getCampaigns';
import eventsRouter from './events';

const volunteerRouter = express.Router({ mergeParams: true });

volunteerRouter.use(deleteHoursRouter);
volunteerRouter.use(interestFormRouter);
volunteerRouter.use(getHoursRouter);
volunteerRouter.use(createHoursRouter);
volunteerRouter.use(getCampaignsRouter);
volunteerRouter.use(ckKitchenRouter);
volunteerRouter.use(eventsRouter);

export default volunteerRouter;
