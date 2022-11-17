const express = require('express');
const cors = require('cors');
const paypalRouter = require('./routes/paypal');

const PORT = process.env.PORT || 3000;

// initialize app and add middleware
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use(paypalRouter);

app.get('/', (req, res) => {
  res.send('Server is running.');
});

app.listen(PORT, () => {
  console.log('server listening');
});
