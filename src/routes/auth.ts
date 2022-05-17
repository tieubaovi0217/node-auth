import isAuth from '../middlewares/isAuth';
import attachUser from '../middlewares/attachUser';

import { body } from 'express-validator';
import { Response, Router } from 'express';

import authControllers from '../controllers/auth';
import { ErrorHandler } from '../middlewares/errorHandler';
import { AuthorizedRequest } from '../common/types';

const router = Router();

router.get(
  '/is_auth',
  isAuth,
  attachUser,
  (req: AuthorizedRequest, res: Response) => {
    res.json({ username: req.user.username, email: req.user.email });
  },
);

router.post(
  '/login',
  body('username')
    .trim()
    .isLength({ min: 4 })
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
        throw new ErrorHandler(400, 'Passwords do not match');
      }

      return value;
    }),
  authControllers.signup,
);

router.post('/logout', isAuth, async (req, res) => {
  res.send('Logout');
});

export default router;
