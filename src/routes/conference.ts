import { Router } from 'express';

import attachUser from '../middlewares/attachUser';
import isAuth from '../middlewares/isAuth';

import conferenceController from '../controllers/conference';

const router = Router();

router.get('/', isAuth, attachUser, conferenceController.getAllConferences);

router.post('/', isAuth, attachUser, conferenceController.createConference);

router.get('/:id', isAuth, attachUser, conferenceController.getAllResourceURL);

router.get(
  '/:id/metadata',
  isAuth,
  attachUser,
  conferenceController.getMetadata,
);

export default router;
