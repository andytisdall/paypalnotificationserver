import express from 'express';

import jobListingRouter from './homeChefJobListing';
import recipeRouter from './recipes';
import hoursRouter from './hours';
import inviteRouter from './invite';
import campaignRouter from './campaign';
import notificationsRouter from './notifications';

const homeChefRouter = express.Router({ mergeParams: true });

homeChefRouter.use(jobListingRouter);
homeChefRouter.use(recipeRouter);
homeChefRouter.use(hoursRouter);
homeChefRouter.use(inviteRouter);
homeChefRouter.use(campaignRouter);
homeChefRouter.use(notificationsRouter);

export default homeChefRouter;
