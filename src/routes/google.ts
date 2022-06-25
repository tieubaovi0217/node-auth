import { Router } from 'express';

import attachUser from '../middlewares/attachUser';
import isAuth from '../middlewares/isAuth';

import google from '../controllers/google';

const router = Router();

router.get('/save-token', google.saveToken);

router.get('/oauth2url', isAuth, attachUser, google.getOAuth2URL);

router.get('/files', isAuth, attachUser, google.listFiles);

router.get('/:fileId', isAuth, attachUser, google.download);

router.post('/text-to-speech', isAuth, attachUser, google.textToSpeech);

export default router;
