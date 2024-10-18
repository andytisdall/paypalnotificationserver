import express from 'express';

import kitchenRouter from './ckKitchen';
import interestFormRouter from './interestForm';
import volunteerEventsRouter from './volunteerEvents';
import volunteerContactRouter from './volunteerContact';
import createHoursRouter from './createHours';

const volunteerRouter = express.Router({ mergeParams: true });

volunteerRouter.use(kitchenRouter);
volunteerRouter.use(interestFormRouter);
volunteerRouter.use(volunteerEventsRouter);
volunteerRouter.use(volunteerContactRouter);
volunteerRouter.use(createHoursRouter);

export default volunteerRouter;
