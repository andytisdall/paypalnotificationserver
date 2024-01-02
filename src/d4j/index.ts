import express from 'express';

import receiptRouter from './receipt';
import restaurantRouter from './restaurant';
import contactRouter from './contact';
import eventsRouter from './events';
import notificationsRouter from './notifications';

const d4jRouter = express.Router({ mergeParams: true });

d4jRouter.use(contactRouter);
d4jRouter.use(restaurantRouter);
d4jRouter.use(receiptRouter);
d4jRouter.use(eventsRouter);
d4jRouter.use(notificationsRouter);

export default d4jRouter;
