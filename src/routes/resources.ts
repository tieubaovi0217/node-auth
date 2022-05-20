import { Router } from 'express';

import attachUser from '../middlewares/attachUser';
import isAuth from '../middlewares/isAuth';

import resourcesController from '../controllers/resources';

const router = Router();

router.post(
  '/:id/update',
  isAuth,
  attachUser,
  resourcesController.updateResourceURL,
);

router.post('/mkdir', isAuth, attachUser, resourcesController.createFolder);

router.post('/delete', isAuth, attachUser, resourcesController.deleteResource);

router.put('/rename', isAuth, attachUser, resourcesController.rename);

export default router;
