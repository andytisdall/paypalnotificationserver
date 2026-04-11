import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import { getCurrentUser } from "./current-user";

export async function requireTextPermission<T>(
  req: Request<T>,
  res: Response,
  next: NextFunction,
) {
  const { authorization } = req.headers;

  if (!authorization) {
    return next();
  }

  const currentUser = await getCurrentUser(authorization);
  if (!currentUser?.admin && !currentUser?.busDriver) {
    res.status(403);
    throw new Error("User must have permission to send alert texts");
  }

  next();
}
