import express from "express";

import jobListingRouter from "./homeChefJobListing";
import recipeRouter from "./recipes";
import hoursRouter from "./hours";
import inviteRouter from "./invite";
import campaignRouter from "./campaign";
import notificationsRouter from "./notifications";
import quizRouter from "./quiz";
import eventsRouter from "./events";
import onboardingRouter from "./onboarding";

const homeChefRouter = express.Router({ mergeParams: true });

homeChefRouter.use(jobListingRouter);
homeChefRouter.use(recipeRouter);
homeChefRouter.use(hoursRouter);
homeChefRouter.use(inviteRouter);
homeChefRouter.use(campaignRouter);
homeChefRouter.use(notificationsRouter);
homeChefRouter.use(quizRouter);
homeChefRouter.use(eventsRouter);
homeChefRouter.use(onboardingRouter);

export default homeChefRouter;
