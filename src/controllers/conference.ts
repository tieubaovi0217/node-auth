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
      // const resources = await (
      //   await ConferenceModel.findById(req.params.id)
      // ).populate([
      //   {
      //     path: 'host',
      //   },
      //   {
      //     path: 'resources',
      //   },
      // ]);
      const resources = await ResourceModel.find({
        conferenceId: req.params.id,
      }).populate('user');

      res.json(resources);
    } catch (err) {
      next(err);
    }
  },
};
