import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

const User = mongoose.model("User");

export async function requireTextPermission<T>(
  req: Request<T>,
  res: Response,
  next: NextFunction,
) {
  const thisUser = req.currentUser;
  if (!thisUser?.admin && !thisUser?.busDriver) {
    res.status(403);
    throw new Error("User must have permission to send alert texts");
  }

  next();
}
