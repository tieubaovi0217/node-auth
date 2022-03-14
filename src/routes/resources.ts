// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as path from 'path';
import * as fs from 'fs';
import { Router } from 'express';

import attachUser from '../middlewares/attachUser';
import isAuth from '../middlewares/isAuth';

import {
  getDirectories,
  getFolderSizeByGlob,
} from '../helpers/getFilesAndDirectoriesInfo';

const router = Router();

router.delete('/delete/:fileName', isAuth, attachUser, async (req, res) => {
  res.json({ message: `delete file ${req.params.fileName}` });
});

router.put('/rename/:fileName', isAuth, attachUser, async (req, res) => {
  res.json({ message: `rename file ${req.params.fileName}` });
});

router.put('/mkdir', isAuth, attachUser, async (req, res) => {
  const { folderName } = res.body;
  res.send(folderName);
  // const subPath = req.path || '';
  // const dirPath = path.join(
  //   process.env.WEB_SERVER_RESOURCE_PATH,
  //   req.user.username,
  //   subPath,
  // );
});

router.get('*', isAuth, attachUser, async (req, res) => {
  //TODO: check carefully
  const subPath = req.path || '';
  const dirPath = path.join(
    process.env.WEB_SERVER_RESOURCE_PATH,
    req.user.username,
    subPath,
  );

  getDirectories(dirPath, function (err, response) {
    if (err) {
      console.log('Error', err);
      return res.status(500).json(err);
    } else {
      const filterResponse = response.filter((p) => {
        const stats = fs.statSync(p);
        const relativePath = path.relative(dirPath, p);

        return (
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
        // const relativePath = path.relative(dirPath, p);
        let size = stats.size;

        const isDirectDirectory = !name.includes('\\') && stats.isDirectory();
        if (isDirectDirectory) size = getFolderSizeByGlob(p);
        return {
          ext,
          isFile,
          isDirectDirectory,
          size,
          lastModified,
          name,
          relativePath: p,
        };
      });

      const totalSize = getFolderSizeByGlob(dirPath);
      return res.json({ data, totalSize });
    }
  });
});

export default router;
