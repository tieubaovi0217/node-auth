import { config } from 'dotenv';

import { AuthorizedRequest } from '../common/types';

import { Response, NextFunction } from 'express';

config();

export default {
  async saveAvatarUrl(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    console.log(req.body);
    const { avatarUrl } = req.body;
    req.user.avatarUrl = avatarUrl;
    req.user.save();
    res.send('Avatar url saved');
  },
};
