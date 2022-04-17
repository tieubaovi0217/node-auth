// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as util from 'util';

import { config } from 'dotenv';
import { ErrorHandler } from '../error';

config();

const rimrafPromise = util.promisify(rimraf);

export default {
  async createFolder(req, res, next) {
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

  async deleteResource(req, res, next) {
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

  async rename(req, res, next) {},
};
