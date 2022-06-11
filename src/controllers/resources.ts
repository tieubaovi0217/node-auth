import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
// import * as util from 'util';
import { Response, NextFunction } from 'express';

import { ErrorHandler } from '../middlewares/errorHandler';

import { makeResourcePath } from '../shares/makeResourcePath';
import { AuthorizedRequest } from '../common/types';
import { regexCheckFolder } from '../common/constants';
import ResourceModel from '../models/resource';
import UserModel from '../models/user';
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
        makeResourcePath(
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
      const deletePath = makeResourcePath(req.user.username, req.body.path);

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
      const oldPath = makeResourcePath(
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

      const newPath = makeResourcePath(
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
      const { url, hostName, type, conferenceId = {} } = req.body; // set conferenceId default to {} to fail validation
      const existingResource = await ResourceModel.findOne({
        id: req.params.id,
      });
      console.log('[updateResourceURL] - req.body = ', req.body);

      const host = await UserModel.findOne({ username: hostName });
      if (!host) {
        throw new ErrorHandler(400, `User ${hostName} not found`);
      }

      let token;
      if (!existingResource) {
        token = AuthService.getInstance().generateJWT(req.user, '9999 years');
        const resource = new ResourceModel({
          token,
          url,
          type,
          host: host._id,
          id: req.params.id,
          user: req.user._id,
          conferenceId: new mongoose.Types.ObjectId(conferenceId),
        });
        await resource.save();
      } else {
        token = existingResource.token;
        existingResource.url = url;
        existingResource.type = type;
        existingResource.conferenceId = conferenceId;
        existingResource.hostId = host._id;
        await existingResource.save();
      }

      res.json({
        id: req.params.id,
        token,
        url,
        type,
        hostName,
        message: 'Updated resource successfully',
      });
    } catch (err) {
      next(err);
    }
  },
};
