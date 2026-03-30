import express from "express";

import homeChefAppRouter from "./homeChefAppRoutes";
import recipeRouter from "./recipes";
import hoursRouter from "./hours";
import inviteRouter from "./invite";
import campaignRouter from "./campaign";
import notificationsRouter from "./notifications";
import quizRouter from "./quiz";
import onboardingRouter from "./onboarding";
import orderingRouter from "./ordering";
import jobsRouter from "./jobs";
import surveyRouter from "./survey";

const homeChefRouter = express.Router({ mergeParams: true });

homeChefRouter.use(homeChefAppRouter);
homeChefRouter.use(recipeRouter);
homeChefRouter.use(hoursRouter);
homeChefRouter.use(inviteRouter);
homeChefRouter.use(campaignRouter);
homeChefRouter.use(notificationsRouter);
homeChefRouter.use(quizRouter);
homeChefRouter.use(onboardingRouter);
homeChefRouter.use(orderingRouter);
homeChefRouter.use(jobsRouter);
homeChefRouter.use(surveyRouter);

export default homeChefRouter;
