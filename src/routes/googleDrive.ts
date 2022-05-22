import { Router } from 'express';

import attachUser from '../middlewares/attachUser';
import isAuth from '../middlewares/isAuth';

import googleDriveController from '../controllers/googleDrive';

const router = Router();

router.get('/save-token', googleDriveController.saveToken);

router.get(
  '/oauth2url',
  isAuth,
  attachUser,
  googleDriveController.getOAuth2URL,
);

router.get(
  '/:fileId/download',
  isAuth,
  attachUser,
  googleDriveController.download,
);

router.get('/files', isAuth, attachUser, googleDriveController.listFiles);

export default router;
