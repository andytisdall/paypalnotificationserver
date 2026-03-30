import { Request, Response, NextFunction } from "express";

import mongoose from "mongoose";

const User = mongoose.model("User");

export async function requireAdmin<T>(
  req: Request<T>,
  res: Response,
  next: NextFunction,
) {
  if (!req.currentUser?.admin) {
    res.status(403);
    throw new Error("User must be admin");
  }

  next();
}
