import * as express from 'express';

import authRouter from './auth';
import resourcesRouter from './resources';
import uploadRouter from './upload';

const app = express();

app.use(uploadRouter);
app.use('/auth', authRouter);
app.use('/resources', resourcesRouter);

export default app;
