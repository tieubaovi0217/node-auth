import * as path from 'path';
import * as fs from 'fs';
import { Router } from 'express';
import attachUser from '../middlewares/attachUser';
import isAuth from '../middlewares/isAuth';

import { getDirectories } from '../helpers/getDirectories';

const router = Router();

//TODO: add auth middlewares
// router.use(isAuth, attachUser);

router.get('*', async (req, res) => {
  //TODO: check carefully
  const subPath = req.path || '';
  const dirPath = path.join(process.env.WEB_SERVER_RESOURCE_PATH, subPath);

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

      const result = filterResponse.map((p) => {
        const stats = fs.statSync(p);
        const ext = path.extname(p);
        const resourceSize = stats.size;
        const lastModified = stats.ctime;
        const relativePath = path.relative(dirPath, p);
        const isFile = stats.isFile();
        const isDirectDirectory =
          !relativePath.includes('\\') && stats.isDirectory();
        return {
          ext,
          isFile,
          isDirectDirectory,
          resourceSize,
          lastModified,
          name: relativePath,
        };
      });
      return res.json(result);
    }
  });
});

export default router;
