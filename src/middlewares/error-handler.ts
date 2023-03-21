import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let message = err.message;
  if (err.response?.data) {
    message = JSON.stringify(err.response?.data);
  }
  console.error(message);
  if (res.statusCode === 200) {
    res.status(400);
  }
  res.send({ error: message });
};
