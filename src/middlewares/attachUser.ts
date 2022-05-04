import { Response, NextFunction } from 'express';

import UserModel from '../models/user';
import { ErrorHandler } from '../middlewares/errorHandler';
import { AuthorizedRequest } from '../common/types';

export default async (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.token.data;
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new ErrorHandler(401, 'User not found');
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.statusCode === 401) {
      return next(err);
    }
    next(new ErrorHandler(500, 'Internal server error'));
  }
};
