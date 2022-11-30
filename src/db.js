const mongoose = require('mongoose');

const getSecrets = require('./services/getSecrets');

const connectDb = async () => {
  const { MONGO_PASSWORD } = await getSecrets(['MONGO_PASSWORD']);

  const uri = `mongodb+srv://andytisdall:${MONGO_PASSWORD}@cluster0.vpgosgh.mongodb.net/CKdb?retryWrites=true&w=majority`;

  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.connection.on('connected', () => {
    console.log('Connected to mongo cloud');
  });

  mongoose.connection.on('error', (err) => {
    console.error('Error connecting to mongo');
    console.log(err);
  });
};

connectDb();
