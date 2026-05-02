import { Request, Response, NextFunction } from "express";

import { getCurrentUser } from "./current-user";

export async function requireAuth<T>(
  req: Request<T>,
  res: Response,
  next: NextFunction,
) {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(403);
    throw new Error("You must be signed in to do that");
  }

  req.currentUser = await getCurrentUser(authorization);
  if (!req.currentUser) {
    res.status(403);
    throw new Error("You must be signed in to do that");
  }

  next();
}
