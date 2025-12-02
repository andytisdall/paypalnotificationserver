import express from "express";

import phoneRouter from "./phone";
import incomingTextRouter from "./incomingText";
import outgoingTextRouter from "./outgoingText";
import feedbackRouter from "./feedback";
import scheduledTextRouter from "./scheduledText";
import textRecordRouter from "./textRecords";
import statusCallbackRouter from "./statusCallback";
import volunteerRreminderRouter from "./volunteerReminder";

const textRouter = express.Router({ mergeParams: true });

textRouter.use(phoneRouter);
textRouter.use(incomingTextRouter);
textRouter.use(outgoingTextRouter);
textRouter.use(feedbackRouter);
textRouter.use(scheduledTextRouter);
textRouter.use(textRecordRouter);
textRouter.use(statusCallbackRouter);
textRouter.use(volunteerRreminderRouter);

export default textRouter;
