import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import getSecrets from '../utils/getSecrets';
import { D4JContact, getD4JContact } from '../utils/salesforce/SFQuery/contact';

const User = mongoose.model('User');

export interface D4JUserPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      currentD4JUser?: D4JContact;
    }
  }
}

export const currentD4JUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next();
  }

  const { JWT_KEY } = await getSecrets(['JWT_KEY']);
  if (!JWT_KEY) {
    throw Error('No JWT Key found');
  }

  const payload = jwt.verify(
    authorization,
    JWT_KEY
  ) as unknown as D4JUserPayload;
  req.currentD4JUser = await getD4JContact(payload.id);
  next();
};
