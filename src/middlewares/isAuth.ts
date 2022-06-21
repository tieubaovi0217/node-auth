import { config } from 'dotenv';

import * as jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';

import { ErrorHandler } from '../middlewares/errorHandler';
import { AuthorizedRequest } from '../common/types';

config();

export default (req: AuthorizedRequest, res: Response, next: NextFunction) => {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer') ||
    req.query.token
  ) {
    try {
      const token =
        (req.query.token as string) || req.headers.authorization.split(' ')[1];
      console.log(token);
      const decoded = jwt.verify(token, process.env.SECRET_KEY) as any;
      req.token = decoded;
      next();
    } catch (err) {
      next(new ErrorHandler(401, err.message));
    }
    return;
  }

  next(new ErrorHandler(403, 'No authorization token was found'));
};
