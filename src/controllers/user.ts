import * as fs from 'fs';
import { config } from 'dotenv';
import { validationResult } from 'express-validator';

import AuthService from '../services/auth';
import { ErrorHandler } from '../middlewares/errorHandler';
import { makePath } from '../shares/makePath';

import { AuthorizedRequest } from '../common/types';

import { Response, NextFunction } from 'express';

config();

export default {
  async saveAvatarUrl(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    const { avatarUrl } = req.body;
    req.user.avatarUrl = avatarUrl;
    req.user.save();
    res.send('Avatar url saved');
  },
};
