import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

import { AuthorizedRequest } from '../common/types';

import { Response, NextFunction } from 'express';
import { ErrorHandler } from '../middlewares/errorHandler';

config();

export default {
  async saveAvatarUrl(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      console.log(req.body);
      const { avatarUrl } = req.body;
      req.user.avatarUrl = avatarUrl;
      await req.user.save();
      res.send('Avatar url saved');
    } catch (error) {
      next(error);
    }
  },

  async changePassword(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      console.log('[changePassword] - req.body', req.body);
      const { oldPassword, password, confirmPassword } = req.body;
      const isSamePassword = await bcrypt.compare(
        oldPassword,
        req.user.password,
      );
      if (!isSamePassword) {
        throw new ErrorHandler(400, 'Old password wrong!');
      }
      if (password !== confirmPassword) {
        throw new ErrorHandler(400, 'New passwords do not match');
      }
      req.user.password = await bcrypt.hash(
        password,
        Number(process.env.SALT_ROUNDS),
      );
      await req.user.save();
      res.json('Update password successfully');
    } catch (error) {
      next(error);
    }
  },
};
