import * as fs from 'fs';
import { config } from 'dotenv';

import AuthService from '../services/auth';
import { makeResourcePath } from '../shares/makeResourcePath';

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
};
