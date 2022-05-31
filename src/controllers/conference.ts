import { Response, NextFunction } from 'express';
import { AuthorizedRequest } from '../common/types';

import ResourceModel from '../models/resource';
import ConferenceModel from '../models/conference';
import UserModel from '../models/user';
import { ErrorHandler } from '../middlewares/errorHandler';

import { validationResult } from 'express-validator';

export default {
  async getAllConferences(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const conferences = await ConferenceModel.find({});
      res.json(conferences);
    } catch (error) {
      next(error);
    }
  },

  async updateConference(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const existingConference = await ConferenceModel.findOne({
        _id: req.params.id,
      });
      if (!existingConference) {
        throw new ErrorHandler(400, 'Conference does not exist');
      }

      const {
        name,
        startTime,
        endTime,
        timeline = [],
        editors = [],
      } = req.body;

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

      existingConference.name = name;
      existingConference.timeline = timeline;
      existingConference.editors = supportEditors;
      existingConference.startTime = startTime;
      existingConference.endTime = endTime;

      await existingConference.save();
      res.json(existingConference);
    } catch (error) {
      next(error);
    }
  },

  async createConference(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      console.log('[createConference] - req.body = ', req.body);
      const {
        name,
        startTime,
        endTime,
        timeline = [],
        editors = [],
      } = req.body;

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
        timeline,
        startTime,
        endTime,
        editors: supportEditors,
        host: req.user._id,
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
