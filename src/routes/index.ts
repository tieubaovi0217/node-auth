import * as express from 'express';

import authRouter from './auth';
import resourcesRouter from './resources';
import uploadRouter from './upload';
import cloudConvertRouter from './cloudconvert';
import userRouter from './user';

const app = express();

app.use(uploadRouter);
app.use('/auth', authRouter);
app.use('/resources', resourcesRouter);
app.use('/cloudconvert', cloudConvertRouter);
app.use('/user', userRouter);

export default app;
