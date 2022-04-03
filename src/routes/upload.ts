// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as path from 'path';
import * as fs from 'fs';
import { Router } from 'express';
import * as multer from 'multer';

import isAuth from '../middlewares/isAuth';
import attachUser from '../middlewares/attachUser';

import { ErrorHandler } from '../error';

const router = Router();

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
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
  filename: async function (req, file, cb) {
    const filePath = path.join(
      process.env.WEB_SERVER_RESOURCE_PATH,
      req.user.username,
      req.body.destination,
      file.originalname,
    );
    try {
      await fs.promises.stat(filePath);
      // file exists
      cb(new ErrorHandler('400', 'Filename already exists'));
    } catch (err) {
      cb(null, file.originalname);
    }
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000 * 1000 * 1000 },
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
