import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import AuthService from '../services/auth';
import { validationResult } from 'express-validator';
import { ErrorHandler } from '../middlewares/errorHandler';

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

      await fs.promises.mkdir(
        path.join(process.env.WEB_SERVER_RESOURCE_PATH, user.username),
      );
      res.json({ user, token });
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, err.message || 'Signup failed'));
    }
  },
};
