const express = require('express');

const phoneRouter = require('./addPhone');
const incomingTextRouter = require('./incomingText');
const outgoingTextRouter = require('./outgoingText');
const feedbackRouter = require('./feedback');
const surveyRouter = require('./survey');

const textRouter = express.Router({ mergeParams: true });

textRouter.use(phoneRouter);
textRouter.use(incomingTextRouter);
textRouter.use(outgoingTextRouter);
textRouter.use(feedbackRouter);
textRouter.use(surveyRouter);

module.exports = textRouter;
