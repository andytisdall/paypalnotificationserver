import express from 'express';

import receiptRouter from './receipt';
import restaurantRouter from './restaurant';
import contactRouter from './contact';
import eventsRouter from './events';

const d4jRouter = express.Router({ mergeParams: true });

d4jRouter.use(contactRouter);
d4jRouter.use(restaurantRouter);
d4jRouter.use(receiptRouter);
d4jRouter.use(eventsRouter);

export default d4jRouter;
