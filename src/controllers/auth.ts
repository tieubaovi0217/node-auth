import * as path from 'path';
import * as fs from 'fs';
import { config } from 'dotenv';
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
      res.json({ user, token, message: 'Successfully Login' });
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

      res.json({ user, token, message: 'Successfully Signup' });
    } catch (err) {
      next(err);
    }
  },
};
