import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import getSecrets from "../utils/getSecrets";

export interface D4JUserPayload {
  id: string;
}

interface D4JUserModel {
  email: string;
  id: string;
  salesforceId?: string;
  token?: string;
}

declare global {
  namespace Express {
    interface Request {
      currentD4JUser?: D4JUserModel | null;
    }
  }
}

const D4JUser = mongoose.model("D4JUser");

export const currentD4JUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next();
  }

  const { JWT_KEY } = await getSecrets(["JWT_KEY"]);
  if (!JWT_KEY) {
    throw Error("No JWT Key found");
  }

  const payload = jwt.verify(
    authorization,
    JWT_KEY
  ) as unknown as D4JUserPayload;

  req.currentD4JUser = await D4JUser.findById(payload.id);
  next();
};
