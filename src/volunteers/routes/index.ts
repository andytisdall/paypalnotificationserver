import express from 'express';

import eventsAndKitchenVolunteerRouter from './volunteers';
import interestFormRouter from './interestForm';

const volunteerRouter = express.Router({ mergeParams: true });

volunteerRouter.use(eventsAndKitchenVolunteerRouter);
volunteerRouter.use(interestFormRouter);

export default volunteerRouter;
