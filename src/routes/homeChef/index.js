const express = require('express');

const jobListingRouter = require('./homeChefJobListing');
const signupRouter = require('./homeChefSignup');
const recipeRouter = require('./recipes');
const surveyRouter = require('./mealSurvery');

const homeChefRouter = express.Router({ mergeParams: true });

homeChefRouter.use(jobListingRouter);
homeChefRouter.use(signupRouter);
homeChefRouter.use(recipeRouter);
homeChefRouter.use(surveyRouter);

module.exports = homeChefRouter;
