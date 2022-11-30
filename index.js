const express = require('express');
const cors = require('cors');

require('./src/db');
require('./src/models/user');
require('./src/models/phone');
const paypalRouter = require('./src/routes/paypal');
const smsRouter = require('./src/routes/sms');
const signinRouter = require('./src/routes/signin');
const userRouter = require('./src/routes/user');
const addPhoneRouter = require('./src/routes/addPhone');

const PORT = process.env.PORT || 3001;

// initialize app and add middleware
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use(paypalRouter);
app.use(smsRouter);
app.use(signinRouter);
app.use(userRouter);
app.use(addPhoneRouter);

app.get('/', (req, res) => {
  res.send('Server is running.');
});

app.listen(PORT, () => {
  console.log('server listening');
});
