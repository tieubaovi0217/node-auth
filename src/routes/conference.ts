import { Router } from 'express';

import attachUser from '../middlewares/attachUser';
import isAuth from '../middlewares/isAuth';

import conferenceController from '../controllers/conference';

import { catchValidationErrors } from '../middlewares/errorHandler';
import {
  checkEndTime,
  checkNameConference,
  checkStartTime,
  checkTimeline,
} from '../middlewares/conference';

const router = Router();

router.get('/', isAuth, attachUser, conferenceController.getAllConferences);

router.post(
  '/',
  isAuth,
  attachUser,
  checkNameConference,
  checkStartTime,
  checkEndTime,
  checkTimeline,
  catchValidationErrors,
  conferenceController.createConference,
);

router.put(
  '/:id',
  isAuth,
  attachUser,
  checkNameConference,
  checkTimeline,
  checkStartTime,
  checkEndTime,
  catchValidationErrors,
  conferenceController.updateConference,
);

router.get('/:id', isAuth, attachUser, conferenceController.getAllResourceURL);

router.get(
  '/:id/metadata',
  isAuth,
  attachUser,
  conferenceController.getMetadata,
);

router.delete('/:id', isAuth, attachUser, conferenceController.delete);

export default router;
