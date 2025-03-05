import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

const User = mongoose.model('User');

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.currentUser) {
    res.status(401);
    throw new Error('You must be signed in to do that');
  }

  const thisUser = await User.findById(req.currentUser.id);
  if (!thisUser) {
    res.status(404);
    throw new Error('User Not Found');
  }

  next();
};
