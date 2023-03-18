import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  if (err.response?.data) {
    console.log(JSON.stringify(err.response?.data));
  }
  if (res.statusCode === 200) {
    res.status(400);
  }
  res.send({ error: err.message });
};
