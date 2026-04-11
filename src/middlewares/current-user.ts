import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import getSecrets from "../utils/getSecrets";

const User = mongoose.model("User");

export interface UserPayload {
  id: string;
}

export interface UserModel {
  id: string;
  username: string;
  password: string;
  admin: boolean;
  active: boolean;
  salesforceId: string;
  busDriver?: boolean;
  googleId: string;
  appleId?: string;
  homeChefNotificationToken?: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserModel;
    }
  }
}

export const getCurrentUser = async (authorization: string) => {
  const { JWT_KEY } = await getSecrets(["JWT_KEY"]);
  if (!JWT_KEY) {
    throw Error("No JWT Key found");
  }

  try {
    const payload = jwt.verify(
      authorization,
      JWT_KEY,
    ) as unknown as UserPayload;
    return (await User.findById(payload.id)) || undefined;
  } catch (err) {
    return undefined;
  }
};

export async function currentUser<T>(
  req: Request<T>,
  _res: Response,
  next: NextFunction,
) {
  const { authorization } = req.headers;

  if (!authorization) {
    return next();
  }

  req.currentUser = await getCurrentUser(authorization);
  next();
}
