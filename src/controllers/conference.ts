import { Response, NextFunction } from 'express';
import { AuthorizedRequest } from '../common/types';

import ResourceModel from '../models/resource';
import ConferenceModel from '../models/conference';
import UserModel from '../models/user';
import { ErrorHandler } from '../middlewares/errorHandler';

export default {
  async createConference(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      console.log('[createConference] - req.body = ', req.body);
      const { name, editors, date } = req.body;

      const existingConference = await ConferenceModel.findOne({ name });
      if (existingConference) {
        throw new ErrorHandler(400, `Conference name '${name}' already exist!`);
      }

      const supportEditors = [];
      for (const editor of editors) {
        const existingUser = await UserModel.findOne({
          username: editor.username,
        });
        if (!existingUser) {
          throw new ErrorHandler(
            400,
            `User '${editor.username}' does not exist!`,
          );
        }
        if (editor.username === req.user.username) {
          throw new ErrorHandler(
            400,
            'Editor username should not be the same as creator!',
          );
        }
        supportEditors.push(existingUser._id);
      }
      const newConference = new ConferenceModel({
        name,
        editors: supportEditors,
        host: req.user._id,
        startTime: new Date(date[0]),
        endTime: new Date(date[1]),
      });
      await newConference.save();
      res.json(newConference);
    } catch (error) {
      next(error);
    }
  },

  async getAllResourceURL(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const resources = await ResourceModel.find({
        conferenceId: req.params.id,
      }).populate('user');

      res.json(resources);
    } catch (err) {
      next(err);
    }
  },

  async getMetadata(req: AuthorizedRequest, res: Response, next: NextFunction) {
    try {
      const conference = await ConferenceModel.findOne({ _id: req.params.id });
      return res.json(conference);
    } catch (error) {
      next(error);
    }
  },
};
