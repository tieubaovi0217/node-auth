import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
// import * as util from 'util';

import { config } from 'dotenv';
import { ErrorHandler } from '../middlewares/errorHandler';

import { Response, NextFunction } from 'express';

import { AuthorizedRequest } from '../common/types';

config();

// const rimrafPromise = util.promisify(rimraf);

export default {
  async createFolder(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await fs.promises.mkdir(
        path.join(
          process.env.WEB_SERVER_RESOURCE_PATH,
          req.user.username,
          req.body.destination || '',
          req.body.newFolderName || '',
        ),
      );
      res.json('Create new folder successfully');
    } catch (err) {
      console.error(err);
      next(new ErrorHandler(400, 'Create new folder failed'));
    }
  },

  async deleteResource(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const deletePath = path.join(
        process.env.WEB_SERVER_RESOURCE_PATH,
        req.user.username,
        req.body.path,
      );

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
      console.error(err);
      next(new ErrorHandler(400, 'Delete file or folder failed'));
    }
  },

  async rename(req: AuthorizedRequest, res: Response, next: NextFunction) {
    try {
      const oldPath = path.join(
        process.env.WEB_SERVER_RESOURCE_PATH,
        req.user.username,
        req.body.oldPath,
      );
      const newPath = path.join(
        process.env.WEB_SERVER_RESOURCE_PATH,
        req.user.username,
        req.body.newPath,
      );
      await fs.promises.rename(oldPath, newPath);
      res.json({
        message: `${req.body.oldPath} has been renamed to ${req.body.newPath}`,
      });
    } catch (error) {
      console.log(error);
      next(new ErrorHandler(400, 'Rename file or folder failed'));
    }
  },
};
