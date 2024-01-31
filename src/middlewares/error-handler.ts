import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let message = err.message;
  if (err.response?.data?.message) {
    message = JSON.stringify(err.response.data.message);
  }
  if (err.response?.data) {
    if (Array.isArray(err.response.data)) {
      // salesforce error
      message = err.response.data[0];
      if (message.errorCode) {
        console.log(message.message);
        return res.status(400).send({ error: 'Error Retreiving Data' });
      }
    } else {
      message = err.response.data;
    }
  } else if (err.response?.body) {
    message = JSON.stringify(err.response.body);
  }
  console.error(err);
  console.log(message);
  if (res.statusCode === 200) {
    res.status(400);
  }
  res.send({ error: message });
};
