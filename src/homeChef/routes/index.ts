import express from 'express';

import jobListingRouter from './homeChefJobListing';
import signupRouter from '../../homeChef/routes/homeChefSignup';
import recipeRouter from './recipes';
import hoursRouter from './hours';

const homeChefRouter = express.Router({ mergeParams: true });

homeChefRouter.use(jobListingRouter);
homeChefRouter.use(signupRouter);
homeChefRouter.use(recipeRouter);
homeChefRouter.use(hoursRouter);

export default homeChefRouter;
