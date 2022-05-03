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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorHandler(400, errors.array()[0].msg));
    }

    const { username, password } = req.body;
    try {
      const { user, token } = await AuthService.getInstance().login(
        username,
        password,
      );
      res.json({ user, token });
    } catch (err) {
      next(new ErrorHandler(400, err.message || 'Login failed'));
    }
  },

  async signup(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorHandler(400, errors.array()[0].msg));
    }

    try {
      const { user, token } = await AuthService.getInstance().signUp(req.body);

      await fs.promises.mkdir(makePath(user.username, ''));
      res.json({ user, token });
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, err.message || 'Signup failed'));
    }
  },
};
