import { Request, Response, NextFunction } from "express";

import { getCurrentUser } from "./current-user";

export async function requireAuth<T>(
  req: Request<T>,
  res: Response,
  next: NextFunction,
) {
  const { authorization } = req.headers;

  if (!authorization) {
    return next();
  }

  const currentUser = await getCurrentUser(authorization);
  if (!currentUser) {
    res.status(401);
    throw new Error("You must be signed in to do that");
  }

  next();
}
