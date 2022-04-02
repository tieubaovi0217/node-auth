import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import AuthService from '../services/auth';
import { validationResult } from 'express-validator';
import { ErrorHandler } from '../error';

config();
export default {
  async login(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorHandler(400, errors.array()[0].msg));
    }

    const { username, password } = req.body;
    try {
      const authService = AuthService.getInstance();
      const { user, token } = await authService.login(username, password);
      res.json({ user, token });
    } catch (err) {
      next(err);
    }
  },

  async signup(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorHandler(400, errors.array()[0].msg));
    }

    try {
      const authService = AuthService.getInstance();
      const { user, token } = await authService.signUp(req.body);

      await fs.promises.mkdir(
        path.join(process.env.WEB_SERVER_RESOURCE_PATH, req.user.username),
      );
      res.json({ user, token });
    } catch (err) {
      next(err);
    }
  },
};
