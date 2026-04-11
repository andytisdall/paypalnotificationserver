import { Request, Response, NextFunction } from "express";

import { UserModel, getCurrentUser } from "./current-user";

export async function requireAdmin<T>(
  req: Request<T>,
  res: Response,
  next: NextFunction,
) {
  const { authorization } = req.headers;

  if (!authorization) {
    return next();
  }

  const currentUser = await getCurrentUser(authorization);

  if (!currentUser?.admin) {
    res.status(403);
    throw new Error("User must be admin");
  }

  next();
}
