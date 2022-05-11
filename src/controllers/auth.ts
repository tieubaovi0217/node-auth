import * as fs from 'fs';
import { config } from 'dotenv';
import { validationResult } from 'express-validator';

import AuthService from '../services/auth';
import { ErrorHandler } from '../middlewares/errorHandler';
import { makePath } from '../shares/makePath';

import { Request, Response, NextFunction } from 'express';

config();
export default {
  async login(req: Request, res: Response, next: NextFunction) {
    const {
      username,
      password,
    }: {
      username: string;
      password: string;
    } = req.body;
    const errors = validationResult(req);
    try {
      if (!errors.isEmpty()) {
        throw new ErrorHandler(400, errors.array()[0].msg);
      }
      const { user, token } = await AuthService.getInstance().login(
        username,
        password,
      );
      res.json({ user, token });
    } catch (err) {
      next(err);
    }
  },

  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ErrorHandler(400, errors.array()[0].msg);
      }
      const { user, token } = await AuthService.getInstance().signUp(req.body);

      await fs.promises.mkdir(makePath(user.username, ''));
      res.json({ user, token });
    } catch (err) {
      next(err);
    }
  },
};
