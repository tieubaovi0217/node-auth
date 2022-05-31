import { Router } from 'express';

import attachUser from '../middlewares/attachUser';
import isAuth from '../middlewares/isAuth';

import userController from '../controllers/user';
import { body } from 'express-validator';
import { catchValidationErrors } from '../middlewares/errorHandler';

const router = Router();

router.get(
  '/conferences',
  isAuth,
  attachUser,
  userController.getAllOwnConferences,
);

router.post(
  '/save-avatar-url',
  isAuth,
  attachUser,
  body('avatarUrl').isString().withMessage('avatarUrl must be a URL'),
  catchValidationErrors,
  userController.saveAvatarURL,
);

router.post(
  '/changepassword',
  isAuth,
  attachUser,
  body('password')
    .isLength({ min: 4 })
    .custom((value, { req }) => {
      if (value !== req.body.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      return value;
    }),
  catchValidationErrors,
  userController.changePassword,
);

export default router;
