import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

import { AuthorizedRequest, UserContactInfo } from '../common/types';

import { Response, NextFunction } from 'express';
import { ErrorHandler } from '../middlewares/errorHandler';

import ConferenceModel from '../models/conference';

config();

export default {
  async saveAvatarURL(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      console.log('[saveAvatarURL] - req.body = ', req.body);
      const { avatarUrl } = req.body;
      req.user.avatarUrl = avatarUrl + `?${Date.now()}`;
      console.log('[saveAvatarUrl] - avatarUrl = ', req.user.avatarUrl);
      await req.user.save();
      res.json({ avatarUrl: req.user.avatarUrl });
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
      const { oldPassword, password, isReset = false } = req.body;
      if (!isReset) {
        const isSamePassword = await bcrypt.compare(
          oldPassword,
          req.user.password,
        );
        if (!isSamePassword) {
          throw new ErrorHandler(400, 'Old password wrong!');
        }
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

  async getAllOwnConferences(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const conferences = await ConferenceModel.find({
        host: req.user._id,
      });
      res.json(conferences);
    } catch (error) {
      next(error);
    }
  },

  async updateInfo(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<UserContactInfo | void> {
    try {
      console.log('[updateInfo] - req.body = ', req.body);
      const { phoneNumber, address } = req.body;
      req.user.phoneNumber = phoneNumber;
      req.user.address = address;
      await req.user.save();

      res.json({
        phoneNumber: req.user.phoneNumber,
        address: req.user.address,
      });
    } catch (error) {
      next(error);
    }
  },
};
