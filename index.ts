import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { join } from 'path';
import 'express-async-errors';

import { connectDb } from './setupDb';

// register models
import './src/models/user';
import './src/models/phone';
import './src/models/restaurant';
import './src/models/recipe';
import './src/models/feedback';
import './src/models/paypalTxn';

// routes

// paypal
import paypalRouter from './src/paypal/routes/paypal';

// text
import textRouter from './src/text/routes';

// restaurant onboarding
import restaurantRouter from './src/mealProgram/routes/restaurant';

//files
import fileRouter from './src/files/routes/files';

// home chef
import homeChefRouter from './src/homeChef/routes';

// shared
import docusignRouter from './src/docusign/routes/signDocuments';

// auth
import authRouter from './src/auth/routes/auth';
import userRouter from './src/auth/routes/user';

import { errorHandler } from './src/middlewares/error-handler';

const PORT = process.env.PORT || 3001;

// initialize app and add middleware
const app = express();
app.set('trust proxy', true);
app.use('/static', express.static(join('public', 'static')));
app.use('/images', express.static(join('public', 'images')));
app.get('/manifest.json', (req, res) =>
  res.sendFile(join('public', 'manifest.json'), { root: __dirname })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(fileUpload());

// add /api to all routers so we don't get our urls mixed up with frontend

const apiRouter = express.Router({ mergeParams: true });

apiRouter.use('/paypal', paypalRouter);
apiRouter.use(authRouter);
apiRouter.use('/user', userRouter);
apiRouter.use('/text', textRouter);
apiRouter.use(restaurantRouter);
apiRouter.use('/files', fileRouter);
apiRouter.use('/docusign', docusignRouter);
apiRouter.use('/home-chef', homeChefRouter);

apiRouter.use(errorHandler);
apiRouter.get('/*', (req, res) => {
  res.sendStatus(404);
});

app.use('/api', apiRouter);

app.get('/*', (req, res) => {
  res.sendFile(join('public', 'index.html'), { root: __dirname });
});

if (process.env.NODE_ENV !== 'test') {
  connectDb();
  app.listen(PORT, () => {
    console.log('server listening');
  });
}

export default app;
