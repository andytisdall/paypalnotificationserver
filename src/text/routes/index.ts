import express from 'express';

import phoneRouter from './phone';
import incomingTextRouter from './incomingText';
import outgoingTextRouter from './outgoingText';
import feedbackRouter from './feedback';
import surveyRouter from './survey';
import scheduledTextRouter from './scheduledText';

const textRouter = express.Router({ mergeParams: true });

textRouter.use(phoneRouter);
textRouter.use(incomingTextRouter);
textRouter.use(outgoingTextRouter);
textRouter.use(feedbackRouter);
textRouter.use(surveyRouter);
textRouter.use(scheduledTextRouter);

export default textRouter;
