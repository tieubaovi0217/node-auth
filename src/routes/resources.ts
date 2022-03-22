// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import { Router } from 'express';

import attachUser from '../middlewares/attachUser';
import isAuth from '../middlewares/isAuth';

import {
  getDirectories,
  getFolderSizeByGlob,
} from '../helpers/getFilesAndDirectoriesInfo';

const router = Router();

router.post('/mkdir', isAuth, attachUser, async (req, res) => {
  try {
    const dir = path.join(
      process.env.WEB_SERVER_RESOURCE_PATH,
      req.user.username,
      req.body.relativePath,
      req.body.newFolderName,
    );
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    } else {
      throw new Error('Create new folder failed');
    }
    res.json(true);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/delete', isAuth, attachUser, async (req, res) => {
  try {
    const deletePath = path.join(
      process.env.WEB_SERVER_RESOURCE_PATH,
      req.user.username,
      req.body.path,
    );

    const stats = fs.statSync(deletePath);
    if (stats.isDirectory()) {
      rimraf.sync(deletePath);
    } else {
      fs.unlinkSync(deletePath);
    }

    res.json({ message: `delete file ${deletePath} successfully` });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
});

router.put('/rename/:fileName', isAuth, attachUser, async (req, res) => {
  res.json({ message: `rename file ${req.params.fileName}` });
});

router.get('*', isAuth, attachUser, async (req, res) => {
  //TODO: check carefully
  const subPath = req.path === '/' ? '' : req.path;
  const dirPath = path.join(
    process.env.WEB_SERVER_RESOURCE_PATH,
    req.user.username,
    subPath,
  );
  console.log('[subPath]', subPath);
  console.log('[dirPath]', dirPath);

  getDirectories(dirPath, function (err, response) {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: err.message });
    } else {
      const filterResponse = response.filter((p) => {
        const stats = fs.statSync(p);
        const relativePath = path.relative(dirPath, p);

        return (
          !relativePath.includes('/') &&
          !relativePath.includes('\\') &&
          (stats.isFile() || stats.isDirectory())
        );
      });

      const data = filterResponse.map((p) => {
        const stats = fs.statSync(p);
        const ext = path.extname(p);
        const lastModified = stats.ctime;
        const name = path.basename(p);
        const isFile = stats.isFile();
        const relativePath = path.relative(
          path.join(process.env.WEB_SERVER_RESOURCE_PATH, req.user.username),
          p,
        );
        let size = stats.size;

        const isDirectDirectory =
          !name.includes('/') && !name.includes('\\') && stats.isDirectory();
        if (isDirectDirectory) size = getFolderSizeByGlob(p);
        return {
          ext,
          isFile,
          isDirectDirectory,
          size,
          lastModified,
          name,
          relativePath,
        };
      });

      const totalSize = getFolderSizeByGlob(dirPath);
      return res.json({ data, totalSize });
    }
  });
});

export default router;
