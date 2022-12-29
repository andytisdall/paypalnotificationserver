const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path')

require('./src/db');
require('./src/models/user');
require('./src/models/phone');
require('./src/models/restaurant');
require('express-async-errors');
const paypalRouter = require('./src/routes/paypal');
const smsRouter = require('./src/routes/sms');
const signinRouter = require('./src/routes/signin');
const userRouter = require('./src/routes/user');
const addPhoneRouter = require('./src/routes/addPhone');
const incomingSmsRouter = require('./src/routes/incoming-message');
const restaurantRouter = require('./src/routes/restaurant');
const fileRouter = require('./src/routes/files');
const docusignRouter = require('./src/routes/signDocuments');
const { errorHandler } = require('./src/middlewares/error-handler');

const PORT = process.env.PORT || 3001;

// initialize app and add middleware
const app = express();

app.use(express.static(path.join(__dirname, 'src/client/build')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(fileUpload());

// add /api to all routers so we don't get our urls mixed up with frontend

const apiRouter = express.Router({ mergeParams: true });

apiRouter.use(paypalRouter);
apiRouter.use(smsRouter);
apiRouter.use(signinRouter);
apiRouter.use(userRouter);
apiRouter.use(addPhoneRouter);
apiRouter.use(incomingSmsRouter);
apiRouter.use(restaurantRouter);
apiRouter.use(fileRouter);
apiRouter.use(docusignRouter);

app.use(errorHandler);

app.use('/api', apiRouter)

app.get('/*', (req, res) => {
  res.sendFile('src/client/build/index.html', { root: __dirname });
});

app.listen(PORT, () => {
  console.log('server listening');
});
