import * as express from 'express';

import authRouter from './auth';
import resourcesRouter from './resources';

const app = express();

app.use('/auth', authRouter);
app.use('/root', resourcesRouter);

export default app;
