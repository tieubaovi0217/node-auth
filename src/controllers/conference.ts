import { Response, NextFunction } from 'express';
import { AuthorizedRequest } from '../common/types';

import ResourceModel from '../models/resource';
import ConferenceModel from '../models/conference';

export default {
  async createConference(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id, name } = req.body;
      const conference = new ConferenceModel({
        id,
        name,
        host: req.user._id,
      });
      await conference.save();
      res.json(conference);
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
