import { Router } from 'express';

import attachUser from '../middlewares/attachUser';
import isAuth from '../middlewares/isAuth';

import resourcesController from '../controllers/resources';

const router = Router();

router.get(
  '/all-resource-url',
  isAuth,
  attachUser,
  resourcesController.getAllResourceURL,
);

router.post('/mkdir', isAuth, attachUser, resourcesController.createFolder);

router.post('/delete', isAuth, attachUser, resourcesController.deleteResource);

router.put('/rename', isAuth, attachUser, resourcesController.rename);

router.post(
  '/update-url',
  isAuth,
  attachUser,
  resourcesController.updateResourceURL,
);

export default router;
