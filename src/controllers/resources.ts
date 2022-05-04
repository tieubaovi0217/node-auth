import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
// import * as util from 'util';
import { Response, NextFunction } from 'express';

import { ErrorHandler } from '../middlewares/errorHandler';

import { makePath } from '../shares/makePath';
import { AuthorizedRequest } from '../common/types';
import { checkValidFolderName } from '../shares/checkValidity';
import { regexCheckFile } from '../common/constants';

config();

// const rimrafPromise = util.promisify(rimraf);

export default {
  async createFolder(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      checkValidFolderName(req.body.newFolderName);
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
      if (err.code === 'ENOENT') {
        return next(new ErrorHandler(400, 'No such file or directory'));
      }
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
        checkValidFolderName(req.body.newPath);
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
      if (err.code === 'ENOENT') {
        return next(new ErrorHandler(400, 'No such file or directory'));
      }
      next(err);
    }
  },
};
