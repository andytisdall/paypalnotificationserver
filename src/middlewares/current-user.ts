import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import getSecrets from '../utils/getSecrets';

const User = mongoose.model('User');

interface UserPayload {
  id: string;
  admin: boolean;
  active: boolean;
  salesforceId: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload | null;
    }
  }
}

export const currentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization) {
    console.log('no jwt');
    return next();
  }

  const { JWT_KEY } = await getSecrets(['JWT_KEY']);
  if (!JWT_KEY) {
    throw Error('No JWT Key found');
  }

  const payload = jwt.verify(authorization, JWT_KEY) as unknown as UserPayload;
  req.currentUser = await User.findById(payload.id);
  next();
};
