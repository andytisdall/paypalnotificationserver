const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
require('express-async-errors');

// register models
require('./src/db');
require('./src/models/user');
require('./src/models/phone');
require('./src/models/restaurant');
require('./src/models/recipe');
require('./src/models/feedback');
require('./src/models/feedback');

// routes

// paypal
const paypalRouter = require('./src/routes/paypal/paypal');

// text
const textRouter = require('./src/routes/textService');

// restaurant onboarding
const restaurantRouter = require('./src/routes/restaurantOnboarding/restaurant');
const fileRouter = require('./src/routes/restaurantOnboarding/files');

// home chef
const homeChefRouter = require('./src/routes/homeChef');

// shared
const docusignRouter = require('./src/routes/signDocuments');

// auth
const signinRouter = require('./src/routes/auth/signin');
const userRouter = require('./src/routes/auth/user');

const dbRouter = require('./src/routes/db');

const { errorHandler } = require('./src/middlewares/error-handler');

const PORT = process.env.PORT || 3001;

// initialize app and add middleware
const app = express();

const root = path.join(__dirname, 'client', 'build');
app.use('/', express.static(root));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(fileUpload());

// add /api to all routers so we don't get our urls mixed up with frontend

const apiRouter = express.Router({ mergeParams: true });

apiRouter.use(paypalRouter);
apiRouter.use(signinRouter);
apiRouter.use(userRouter);
apiRouter.use('/text', textRouter);
apiRouter.use(restaurantRouter);
apiRouter.use(fileRouter);
apiRouter.use(docusignRouter);
apiRouter.use('/home-chef', homeChefRouter);
apiRouter.use(dbRouter);

apiRouter.use(errorHandler);

app.use('/api', apiRouter);

app.get('/*', (req, res) => {
  res.sendFile('index.html', { root });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('server listening');
  });
}

module.exports = app;
