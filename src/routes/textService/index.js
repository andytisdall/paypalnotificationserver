const express = require('express');

const phoneRouter = require('./addPhone');
const incomingTextRouter = require('./incomingText');
const outgoingTextRouter = require('./outgoingText');
const feedbackRouter = require('./feedback');

const textRouter = express.Router({ mergeParams: true });

textRouter.use(phoneRouter);
textRouter.use(incomingTextRouter);
textRouter.use(outgoingTextRouter);
textRouter.use(feedbackRouter);

module.exports = textRouter;
