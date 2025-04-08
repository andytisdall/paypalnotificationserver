import express from "express";

import deleteHoursRouter from "./deleteHours";
import interestFormRouter from "./interestForm";
import getHoursRouter from "./getHours";
import getVolunteerRouter from "./getVolunteer";
import createHoursRouter from "./createHours";
import getCampaignsRouter from "./getCampaigns";
import eventsRouter from "./events";
import checkInRouter from "./checkIn";

const volunteerRouter = express.Router({ mergeParams: true });

volunteerRouter.use(deleteHoursRouter);
volunteerRouter.use(interestFormRouter);
volunteerRouter.use(getHoursRouter);
volunteerRouter.use(createHoursRouter);
volunteerRouter.use(getCampaignsRouter);
volunteerRouter.use(getVolunteerRouter);
volunteerRouter.use(eventsRouter);
volunteerRouter.use(checkInRouter);

export default volunteerRouter;
