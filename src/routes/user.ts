import { Router } from 'express';

import attachUser from '../middlewares/attachUser';
import isAuth from '../middlewares/isAuth';

import userController from '../controllers/user';

const router = Router();

router.post(
  '/save-avatar-url',
  isAuth,
  attachUser,
  userController.saveAvatarUrl,
);

router.post(
  '/changepassword',
  isAuth,
  attachUser,
  userController.changePassword,
);

export default router;
