import { Request, Response, NextFunction } from 'express';

import mongoose from 'mongoose';

const User = mongoose.model('User');

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const thisUser = await User.findById(req.currentUser?.id);
  if (!thisUser?.admin) {
    res.status(403);
    throw new Error('User must be admin');
  }

  next();
};
