import { config } from 'dotenv';

import * as jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';

import { ErrorHandler } from '../middlewares/errorHandler';
import { AuthorizedRequest } from '../common/types';

config();

export default (req: AuthorizedRequest, res: Response, next: NextFunction) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.SECRET_KEY,
      ) as jwt.JwtPayload;
      req.token = decoded;
      next();
    } catch (err) {
      next(new ErrorHandler(401, err.message));
    }
    return;
  }

  next(new ErrorHandler(403, 'No authorization token was found'));
};
