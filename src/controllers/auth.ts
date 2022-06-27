import * as fs from 'fs';
import { config } from 'dotenv';

import AuthService from '../services/auth';
import { makeResourcePath } from '../shares/makeResourcePath';

import { Request, Response, NextFunction } from 'express';

import UserModel from '../models/user';

import sendEmail from '../services/sendEmail';
import { ErrorHandler } from '../middlewares/errorHandler';

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
    try {
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
      const { user, token } = await AuthService.getInstance().signUp(req.body);

      await fs.promises.mkdir(makeResourcePath(user.username, ''));
      res.json({ user, token });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body);
      const { email } = req.body;

      const existingEmail = await UserModel.findOne({ email });
      if (!existingEmail) {
        throw new ErrorHandler(400, "There's no account with that email!");
      }

      const otp = Math.floor(Math.random() * 900000) + 100000;
      await sendEmail(email, { otp, expiresIn: 60 * 60 * 3 });
      res.json({
        message:
          'An Email to reset password has been sent to your email! Please check all emails',
      });
    } catch (err) {
      next(err);
    }
  },
};
