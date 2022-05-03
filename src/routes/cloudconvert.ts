import * as fs from 'fs';
import * as path from 'path';
import e, { Response, Router } from 'express';

import { ListFilesInFolder, Unzip, ConvertFile } from '../shares/cloudconvert';

import isAuth from '../middlewares/isAuth';
import attachUser from '../middlewares/attachUser';
import { AuthorizedRequest } from '../common/types';
import { makePath } from '../shares/makePath';

const router = Router();

router.get(
  '/:fileName',
  isAuth,
  attachUser,
  async (req: AuthorizedRequest, res: Response) => {
    const filePath = makePath(req.user.username, req.params.fileName);
    const folderPath = makePath(req.user.username, path.parse(filePath).name);
    console.log('file path:' + filePath);
    console.log('folder path:' + folderPath);
    if (fs.existsSync(folderPath)) {
      console.log('folder exist');
      //create json and send
      const result = await ListFilesInFolder(folderPath);
      res.send(result);
    } else {
      console.log('folder not exist');
      // convert file and make folder
      const zipName = await ConvertFile(filePath, req.user.username);
      Unzip(
        `${process.env.WEB_SERVER_RESOURCE_PATH}/${req.user.username}`,
        zipName,
        res,
      );
      // res.send(result);
      // res.send(ListFilesInFolder(folderPath));
    }
    // res.send("finish job");
  },
);

router.get(
  '/:folder/:fileName',
  isAuth,
  attachUser,
  (req: AuthorizedRequest, res: Response) => {
    const filePath = makePath(
      req.user.username,
      req.params.folder,
      req.params.fileName,
    );
    console.log(filePath);
    res.sendFile(filePath);
  },
);

export default router;
