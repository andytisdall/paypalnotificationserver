import { Request, Response, NextFunction } from "express";

import { UserModel } from "./current-user";

export async function requireAuth<T>(
  req: Request<T>,
  res: Response,
  next: NextFunction,
) {
  if (!req.currentUser) {
    res.status(401);
    throw new Error("You must be signed in to do that");
  }

  next();
}
