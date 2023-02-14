import mongoose from 'mongoose';

import getSecrets from './services/getSecrets';

export const connectDb = async () => {
  const { MONGO_PASSWORD } = await getSecrets(['MONGO_PASSWORD']);

  const uri = `mongodb+srv://andytisdall:${MONGO_PASSWORD}@cluster0.vpgosgh.mongodb.net/CKdb?retryWrites=true&w=majority`;

  mongoose.connect(uri, {});

  mongoose.connection.on('connected', () => {
    console.log('Connected to mongo cloud');
  });

  mongoose.connection.on('error', (err: any) => {
    console.error('Error connecting to mongo');
    console.log(err);
  });
};
