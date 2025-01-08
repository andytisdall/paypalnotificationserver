import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { join } from 'path';
import 'express-async-errors';
import mongoose from 'mongoose';

import { connectDb } from './src/setupDb';

// register models
import './src/auth/models/user';
import './src/mealProgram/models/restaurant';
import './src/homeChef/models/recipe';
import './src/text/models/phone';
import './src/text/models/outgoingTextRecord';
import './src/text/models/feedback';
import './src/paypal/models/paypalTxn';
import './src/homeChef/models/notifications';
import './src/text/models/scheduledText';
import './src/d4j/models/checkIn';
import './src/d4j/models/d4jUser';
import './src/d4j/models/cocktailVote';
import './src/d4j/models/event';

// routes

// paypal
import paypalRouter from './src/paypal/routes/paypal';

// text
import textRouter from './src/text/routes';

// restaurant onboarding
import mealProgramRouter from './src/mealProgram/routes';

//files
import fileRouter from './src/files/routes/files';

// home chef
import homeChefRouter from './src/homeChef/routes';

// auth
import authRouter from './src/auth/routes';

//events
import volunteersRouter from './src/volunteers/routes';

import d4jRouter from './src/d4j/routes';

import signRouter from './src/sign/routes';

import { errorHandler } from './src/middlewares/error-handler';

const PORT = process.env.PORT || 3001;

mongoose.set('strictQuery', false);

// initialize app and add middleware
const app = express();
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

apiRouter.use(authRouter);
apiRouter.use('/paypal', paypalRouter);
apiRouter.use('/text', textRouter);
apiRouter.use('/meal-program', mealProgramRouter);
apiRouter.use('/files', fileRouter);
apiRouter.use('/home-chef', homeChefRouter);
apiRouter.use('/volunteers', volunteersRouter);
apiRouter.use('/d4j', d4jRouter);
apiRouter.use('/sign', signRouter);

apiRouter.use(errorHandler);
apiRouter.get('/*', (req, res) => {
  res.sendStatus(404);
});

app.use('/api', apiRouter);

app.get('/_ah/warmup', (req, res) => {
  res.sendStatus(204);
});

app.get('/*', (req, res) => {
  res.sendFile(join('public', 'index.html'), {
    root: __dirname,
    lastModified: false,
    etag: false,
  });
});

if (process.env.NODE_ENV !== 'test') {
  connectDb();
  app.listen(PORT, () => {
    console.log('server listening');
  });
}

export default app;
