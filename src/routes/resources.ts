// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as util from 'util';
import { Router } from 'express';

import attachUser from '../middlewares/attachUser';
import isAuth from '../middlewares/isAuth';
import { ErrorHandler } from '../error';

const router = Router();

const rimrafPromise = util.promisify(rimraf);

router.post('/mkdir', isAuth, attachUser, async (req, res, next) => {
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
    console.log(err);
    next(new ErrorHandler(400, 'Create new folder failed'));
  }
});

router.post('/delete', isAuth, attachUser, async (req, res, next) => {
  try {
    const deletePath = path.join(
      process.env.WEB_SERVER_RESOURCE_PATH,
      req.user.username,
      req.body.path,
    );

    const stat = await fs.promises.stat(deletePath);
    if (stat.isDirectory()) {
      await rimrafPromise(deletePath);
    } else {
      await fs.promises.unlink(deletePath);
    }
    res.json({ message: `Delete file ${deletePath} successfully` });
  } catch (err) {
    console.log(err);
    next(new ErrorHandler(400, 'Delete file or folder failed'));
  }
});

// router.put('/rename/:fileName', isAuth, attachUser, async (req, res) => {
//   res.json({ message: `rename file ${req.params.fileName}` });
// });

export default router;
