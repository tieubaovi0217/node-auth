import * as fs from 'fs';
import { config } from 'dotenv';
import * as path from 'path';
import { NextFunction, Response, Router } from 'express';

import { ListFilesInFolder, Unzip, ConvertFile } from '../shares/cloudconvert';

import isAuth from '../middlewares/isAuth';
import attachUser from '../middlewares/attachUser';
import { AuthorizedRequest } from '../common/types';
import { makeResourcePath } from '../shares/makeResourcePath';

const router = Router();

config();

router.use(
  '/',
  isAuth,
  attachUser,
  async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    if (req.url.indexOf('?') != -1)
      req.url = req.url.slice(0, req.url.indexOf('?'));
    try {
      const p = path.join(
        process.env.WEB_SERVER_RESOURCE_PATH,
        req.user.username,
        req.url,
      );
      console.log(p);
      const parsedPath = path.parse(p);
      //   return res.json(parsedPath);
      const folderPath = path.join(parsedPath.dir, parsedPath.name);

      console.log('file path:' + p);
      console.log('folder path:' + folderPath);

      if (fs.existsSync(folderPath)) {
        console.log('folder exist');

        const result = await ListFilesInFolder(folderPath);
        return res.json({
          path: '',
          name: '',
          children: result.map((r) => {
            return {
              path: r,
              name: '',
            };
          }),
        });
      }

      console.log('folder not exist');

      fs.mkdirSync(folderPath, { recursive: true });
      const zipName = await ConvertFile(parsedPath.base, parsedPath.dir);
      Unzip(parsedPath.dir, zipName, res);
    } catch (error) {
      next(error);
    }
  },
);

// router.get(
//   '/:fileName',
//   isAuth,
//   attachUser,
//   async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
//     try {
//       const filePath = makeResourcePath(req.user.username, req.params.fileName);
//       const folderPath = makeResourcePath(
//         req.user.username,
//         path.parse(filePath).name,
//       );
//       console.log('file path:' + filePath);
//       console.log('folder path:' + folderPath);
//       if (fs.existsSync(folderPath)) {
//         console.log('folder exist');
//         //create json and send
//         const result = await ListFilesInFolder(folderPath);
//         return res.send(result);
//       } else {
//         console.log('folder not exist');
//         // convert file and make folder
//         const zipName = await ConvertFile(filePath, req.user.username);
//         Unzip(
//           path.join(process.env.WEB_SERVER_RESOURCE_PATH, req.user.username),
//           zipName,
//           res,
//         );
//         // res.send(result);
//         // res.send(ListFilesInFolder(folderPath));
//       }
//       // res.send('finish job');
//     } catch (error) {
//       next(error);
//     }
//   },
// );

// router.get(
//   '/:folder/:fileName',
//   isAuth,
//   attachUser,
//   (req: AuthorizedRequest, res: Response, next: NextFunction) => {
//     try {
//       const filePath = makeResourcePath(
//         req.user.username,
//         req.params.folder,
//         req.params.fileName,
//       );
//       console.log(filePath);
//       res.sendFile(filePath);
//     } catch (error) {
//       next(error);
//     }
//   },
// );

export default router;
