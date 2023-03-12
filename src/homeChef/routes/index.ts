import express from 'express';

import jobListingRouter from './homeChefJobListing';
import signupRouter from '../../homeChef/routes/homeChefSignup';
import recipeRouter from './recipes';
import hoursRouter from './hours';
import inviteRouter from './invite';
import campaignRouter from './campaign';

const homeChefRouter = express.Router({ mergeParams: true });

homeChefRouter.use(jobListingRouter);
homeChefRouter.use(signupRouter);
homeChefRouter.use(recipeRouter);
homeChefRouter.use(hoursRouter);
homeChefRouter.use(inviteRouter);
homeChefRouter.use(campaignRouter);

export default homeChefRouter;
