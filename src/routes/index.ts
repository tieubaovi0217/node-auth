import * as express from 'express';

import user from './user';

const app = express();

user(app);

export default app;