import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
// import * as util from 'util';
import { Response, NextFunction } from 'express';

import { ErrorHandler } from '../middlewares/errorHandler';

import { makePath } from '../shares/makePath';
import { AuthorizedRequest } from '../common/types';
import { regexCheckFolder } from '../common/constants';
import ResourceModel from '../models/resource';
import AuthService from '../services/auth';

import * as mongoose from 'mongoose';

config();

// const rimrafPromise = util.promisify(rimraf);

export default {
  async createFolder(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!regexCheckFolder.test(req.body.newFolderName)) {
        throw new ErrorHandler(400, 'Invalid folder name');
      }
      await fs.promises.mkdir(
        makePath(
          req.user.username,
          req.body.destination,
          req.body.newFolderName,
        ),
      );
      res.json('Create new folder successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteResource(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const deletePath = makePath(req.user.username, req.body.path);

      const stat = await fs.promises.stat(deletePath);
      if (stat.isDirectory()) {
        rimraf(deletePath, () => {
          console.log(`${deletePath} folder is deleted`);
        });
      } else {
        fs.unlink(deletePath, () => {
          console.log(`${deletePath} is deleted`);
        });
      }
      res.json({ message: `Delete file ${deletePath} successfully` });
    } catch (err) {
      next(err);
    }
  },

  async rename(req: AuthorizedRequest, res: Response, next: NextFunction) {
    try {
      const oldPath = makePath(
        req.user.username,
        req.body.currentPath,
        req.body.oldPath,
      );
      const stats = await fs.promises.stat(oldPath);
      if (stats.isFile()) {
        console.log(req.body.newPath);
        const isValidFileName = /^[a-z0-9_.@()-]+\.[^.]+$/i.test(
          req.body.newPath,
        );
        const isValidExtension =
          path.extname(req.body.oldPath) === path.extname(req.body.newPath);

        console.log(isValidFileName, isValidExtension);
        if (!isValidFileName || !isValidExtension)
          throw new ErrorHandler(400, 'Invalid file name');
      } else {
        if (!regexCheckFolder.test(req.body.newPath)) {
          throw new ErrorHandler(400, 'Invalid folder name');
        }
      }

      const newPath = makePath(
        req.user.username,
        req.body.currentPath,
        req.body.newPath,
      );
      await fs.promises.rename(oldPath, newPath);
      res.json({
        message: `${req.body.oldPath} has been renamed to ${req.body.newPath}`,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateResourceURL(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { type, conferenceId = {} } = req.body; // set conferenceId default to {} to fail validation
      const { url } = req.body;
      const existingResource = await ResourceModel.findOne({
        id: req.params.id,
      });
      // if (!url.endsWith('Video')) {
      //   url = url.split(/[?#]/)[0];
      // }
      console.log('[updateResourceURL] - req.body = ', req.body);
      if (!existingResource) {
        const resource = new ResourceModel({
          id: req.params.id,
          url,
          type,
          user: req.user._id,
          token: AuthService.getInstance().generateJWT(req.user, '9999 years'),
          conferenceId: new mongoose.Types.ObjectId(conferenceId),
        });
        await resource.save();
      } else {
        existingResource.url = url;
        existingResource.type = type;
        existingResource.conferenceId = conferenceId;
        await existingResource.save();
      }

      res.json({
        id: req.params.id,
        url,
        type,
        message: 'Updated successfully',
      });
    } catch (err) {
      next(err);
    }
  },
};
