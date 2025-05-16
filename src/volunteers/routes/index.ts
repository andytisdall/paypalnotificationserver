import express from "express";

import deleteHoursRouter from "./deleteHours";
import interestFormRouter from "./interestForm";
import getHoursRouter from "./getHours";
import getVolunteerRouter from "./getVolunteer";
import createHoursRouter from "./createHours";
import getCampaignsRouter from "./getCampaigns";
import eventsRouter from "./events";
import checkInRouter from "./checkIn";
import driverRouter from "./driver";

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

export default volunteerRouter;
