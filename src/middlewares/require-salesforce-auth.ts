import { Request, Response, NextFunction } from 'express';

import getSecrets from '../utils/getSecrets';

export const requireSalesforceAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;
  const { CK_API_KEY } = await getSecrets(['CK_API_KEY']);

  if (!CK_API_KEY) {
    throw Error('Could not find CK API Key');
  }
  if (CK_API_KEY !== authorization) {
    return res.sendStatus(403);
  }

  next();
};
