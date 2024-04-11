import express from 'express';

import restaurantRouter from './restaurant';
import contactRouter from './contact';
import eventsRouter from './events';
import notificationsRouter from './notifications';
import checkInRouter from './checkIn';
import contestRouter from './contest';

const d4jRouter = express.Router({ mergeParams: true });

d4jRouter.use(contactRouter);
d4jRouter.use(restaurantRouter);
d4jRouter.use(eventsRouter);
d4jRouter.use(notificationsRouter);
d4jRouter.use(checkInRouter);
d4jRouter.use(contestRouter);

export default d4jRouter;
