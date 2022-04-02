// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { config } from 'dotenv';
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as cors from 'cors';

// Routes
import routes from './routes';

import { handleError } from './error';

config();

const app = express();

const PORT = process.env.PORT || 5000;
const DATABASE_URL = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`;

// app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// custom routes
app.use(routes);

app.use((err, req, res, next) => {
  handleError(err, res);
});

const main = () => {
  app.listen(PORT, async () => {
    console.log(`Server is listening at port ${PORT}`);
    console.log('Connected to the database!');
  });
};

const doRetryConnectDB = async () => {
  return mongoose.connect(DATABASE_URL, function (err) {
    if (err) {
      console.error(
        'Failed to connect to mongo on startup - retrying in 5 sec',
        err,
      );
      setTimeout(doRetryConnectDB, 5000);
    } else {
      main();
    }
  });
};

doRetryConnectDB();
