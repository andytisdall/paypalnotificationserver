import { Request, Response, NextFunction } from 'express';
import { AxiosError } from 'axios';

export const errorHandler = (
  err: Error | AxiosError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  if (err instanceof AxiosError) {
    console.log(err.response?.data);
  }
  if (res.statusCode === 200) {
    res.status(400);
  }
  res.send({ error: err.message });
};
