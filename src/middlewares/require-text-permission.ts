import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

const User = mongoose.model('User');

export const requireTextPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const thisUser = await User.findById(req.currentUser?.id);
  if (!thisUser?.admin && !thisUser?.busDriver) {
    res.status(403);
    throw new Error('User must have permission to send alert texts');
  }

  next();
};
