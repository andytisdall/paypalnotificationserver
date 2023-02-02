const express = require('express');

const jobListingRouter = require('./homeChefJobListing');
const signupRouter = require('./homeChefSignup');
const recipeRouter = require('./recipes');
const hoursRouter = require('./hours');

const homeChefRouter = express.Router({ mergeParams: true });

homeChefRouter.use(jobListingRouter);
homeChefRouter.use(signupRouter);
homeChefRouter.use(recipeRouter);
homeChefRouter.use(hoursRouter);

module.exports = homeChefRouter;
