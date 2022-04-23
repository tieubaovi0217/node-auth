import * as path from 'path';
import * as fs from 'fs';
import { Router } from 'express';
import * as multer from 'multer';

import isAuth from '../middlewares/isAuth';
import attachUser from '../middlewares/attachUser';

import { ErrorHandler } from '../middlewares/errorHandler';
import { AuthorizedRequest } from 'src/common/types';

const router = Router();

const storage = multer.diskStorage({
  destination: async function (req: AuthorizedRequest, file, cb) {
    // store files to corresponding directory for each user
    // create a directory if user has registered

    const userDir = path.join(
      process.env.WEB_SERVER_RESOURCE_PATH,
      req.user.username,
      req.body.destination,
    );

    try {
      await fs.promises.mkdir(userDir);
    } catch (err) {
      // directory exists
    } finally {
      cb(null, userDir);
    }
  },
  filename: async function (req: AuthorizedRequest, file, cb) {
    const filePath = path.join(
      process.env.WEB_SERVER_RESOURCE_PATH,
      req.user.username,
      req.body.destination,
      file.originalname,
    );
    try {
      await fs.promises.stat(filePath);
      // file exists
      cb(
        new ErrorHandler(400, 'Filename already exists'),
        'filename already exists',
      );
    } catch (err) {
      cb(null, file.originalname);
    }
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000 * 1000 * 1000 }, // maximum 1GB
});

router.use(
  '/upload',
  isAuth,
  attachUser,
  upload.single('file'),
  async (req, res) => {
    console.log(req.file);
    res.send('Files uploaded successfully');
  },
);

export default router;
