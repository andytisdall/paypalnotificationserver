import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let message = err.message;
  console.log(err);
  if (err.response?.data?.message) {
    message = JSON.stringify(err.response.data.message);
  }
  if (err.response?.data) {
    if (Array.isArray(err.response.data)) {
      // salesforce error
      message = err.response.data[0];
      if (message.errorCode) {
        return res.status(400).send({ error: 'Error Retreiving Data' });
      }
    } else if (err.response.data.error.message) {
      message = err.response.data.error.message;
    } else {
      message = err.response.data;
    }
  } else if (err.response?.body) {
    message = JSON.stringify(err.response.body);
  }
  if (res.statusCode === 200) {
    res.status(400);
  }
  res.send({ error: message });
};
