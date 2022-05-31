import { Router } from 'express';

import attachUser from '../middlewares/attachUser';
import isAuth from '../middlewares/isAuth';

import conferenceController from '../controllers/conference';

import { body } from 'express-validator';

import * as _ from 'lodash';

import {
  catchValidationErrors,
  ErrorHandler,
} from '../middlewares/errorHandler';

const router = Router();

router.get('/', isAuth, attachUser, conferenceController.getAllConferences);

router.post(
  '/',
  isAuth,
  attachUser,
  body('name')
    .trim()
    .isLength({ min: 4 })
    .withMessage('name of conference must be at least 4 characters long'),
  body('startTime').isISO8601().withMessage('start time is not valid'),
  body('endTime').isISO8601().withMessage('start time is not valid'),
  body('timeline').custom((value) => {
    for (const t of value) {
      if (isNaN(Date.parse(t.time))) {
        throw new Error('timeline is not valid');
      }
      if (!_.isString(t.content)) {
        throw new Error('content is not valid');
      }
    }
    return true;
  }),
  catchValidationErrors,
  conferenceController.createConference,
);

// router.put('/:id', isAuth, attachUser);

router.get('/:id', isAuth, attachUser, conferenceController.getAllResourceURL);

router.get(
  '/:id/metadata',
  isAuth,
  attachUser,
  conferenceController.getMetadata,
);

export default router;
