// @ts-nocheck
import isAuth from '../middlewares/isAuth';
import attachUser from '../middlewares/attachUser';

import AuthService from '../services/auth';
import { body, validationResult } from 'express-validator';
import { Router } from 'express';

import authControllers from '../controllers/auth';

const router = Router();

router.post(
  '/login',
  body('username')
    .isLength({ min: 4 })
    .trim()
    .withMessage('username must be at least 4 characters long'),
  authControllers.login,
);

router.post(
  '/signup',
  body('username')
    .isLength({ min: 4 })
    .withMessage('username must be at least 4 characters long'),
  body('email').isEmail().withMessage('must be a valid email'),
  body('password')
    .isLength({ min: 4 })
    .custom((value, { req }) => {
      if (value !== req.body.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      return value;
    }),
  authControllers.signup,
);

router.post(
  '/changepassword',
  isAuth,
  attachUser,
  body('newPassword')
    .isLength({ min: 4 })
    .withMessage('password must be at least 4 characters long'),
  authControllers.changePassword,
);

router.post('/logout', isAuth, async (req, res) => {
  //TODO: remove token from client
  res.send('Logout');
});

export default router;
