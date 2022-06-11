import { Response, NextFunction } from 'express';
import { AuthorizedRequest } from '../common/types';

import ResourceModel from '../models/resource';
import ConferenceModel from '../models/conference';

import { ErrorHandler } from '../middlewares/errorHandler';

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

      const { name, startTime, endTime, timeline = [] } = req.body;

      existingConference.name = name;
      existingConference.timeline = timeline;
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
      const { name, startTime, endTime, timeline = [] } = req.body;

      const existingConference = await ConferenceModel.findOne({ name });
      if (existingConference) {
        throw new ErrorHandler(400, `Conference name '${name}' already exist!`);
      }

      const newConference = new ConferenceModel({
        name,
        timeline,
        startTime,
        endTime,
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
      })
        .populate('user')
        .populate('hostId', 'username');

      console.log(resources);

      const result = resources.map((r: any) => {
        return {
          ...r._doc,
          hostName: r._doc?.hostId?.username,
        };
      });
      res.json(result);
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

  async delete(req: AuthorizedRequest, res: Response, next: NextFunction) {
    try {
      const conference = await ConferenceModel.deleteOne({
        _id: req.params.id,
      });
      return res.json({ ...conference, message: 'Conference Deleted!' });
    } catch (error) {
      next(error);
    }
  },
};
