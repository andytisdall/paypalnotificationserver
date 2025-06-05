import express from "express";

import deleteHoursRouter from "./hours/deleteHours";
import interestFormRouter from "./interestForm";
import getHoursRouter from "./hours/getHours";
import getVolunteerRouter from "./contact";
import createHoursRouter from "./hours/createHours";
import getCampaignsRouter from "./campaigns";
import eventsRouter from "./events";
import checkInRouter from "./checkIn";
import driverRouter from "./driver";
import jobsRouter from "./jobs";

const volunteerRouter = express.Router({ mergeParams: true });

volunteerRouter.use(deleteHoursRouter);
volunteerRouter.use(interestFormRouter);
volunteerRouter.use(getHoursRouter);
volunteerRouter.use(createHoursRouter);
volunteerRouter.use(getCampaignsRouter);
volunteerRouter.use(eventsRouter);
volunteerRouter.use(checkInRouter);
volunteerRouter.use(driverRouter);
volunteerRouter.use(getVolunteerRouter);
volunteerRouter.use(jobsRouter);

export default volunteerRouter;
