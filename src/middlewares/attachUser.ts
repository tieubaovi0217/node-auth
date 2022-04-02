import UserModel from '../models/user';

import { ErrorHandler } from '../error';

export default async (req, res, next) => {
  try {
    const { email } = req.token.data;
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new ErrorHandler(401, 'User not found');
    }
    req.user = user;
    next();
  } catch (err) {
    throw new ErrorHandler(500, 'Internal server error');
  }
};
