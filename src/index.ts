import { config } from 'dotenv';
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';

import { DEFAULT_PORT, RETRY_TIME } from './common/constants';

// import * as cors from 'cors';

// Routes
import routes from './routes';

// Middlewares
import errorHandlerMiddleware from './middlewares/errorHandler';

config();

const app = express();

const DATABASE_URL = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`;

// app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// custom routes
app.use(routes);

app.use(errorHandlerMiddleware);

const main = () => {
  doRetryConnectDB(() => {
    const PORT = process.env.PORT || DEFAULT_PORT;
    app.listen(PORT, async () => {
      console.log(`Server is listening at port ${PORT}`);
    });
  });
};

const doRetryConnectDB = async (callback: () => void) => {
  return mongoose.connect(DATABASE_URL, function (err) {
    if (err) {
      console.error(
        `Failed to connect to mongo on startup - retrying in ${RETRY_TIME} sec`,
        err,
      );
      setTimeout(() => {
        doRetryConnectDB(callback);
      }, RETRY_TIME * 1000);
    } else {
      console.log('Connected to the database!');
      callback();
    }
  });
};

main();
