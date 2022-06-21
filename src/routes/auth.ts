import isAuth from '../middlewares/isAuth';
import attachUser from '../middlewares/attachUser';

import { body } from 'express-validator';
import { Response, Router } from 'express';

import authControllers from '../controllers/auth';
import { AuthorizedRequest } from '../common/types';

import { catchValidationErrors } from '../middlewares/errorHandler';

const router = Router();

router.get(
  '/is_auth',
  isAuth,
  attachUser,
  (req: AuthorizedRequest, res: Response) => {
    req.user.password = undefined;
    req.user.tokens = undefined;
    res.json(req.user);
  },
);

router.post('/login', authControllers.login);

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
  catchValidationErrors,
  authControllers.signup,
);

router.post('/logout', isAuth, async (req, res) => {
  res.send('Logout');
});

export default router;
