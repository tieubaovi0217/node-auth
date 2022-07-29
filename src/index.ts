import { config } from 'dotenv';
import * as morgan from 'morgan';
import * as mongoose from 'mongoose';
import * as express from 'express';
import * as bodyParser from 'body-parser';
// import * as https from 'https';
// import * as fs from 'fs';
// import * as path from 'path';

import { DEFAULT_PORT, RETRY_TIME } from './common/constants';

// import * as cors from 'cors';

// Routes
import routes from './routes';

// Middlewares
import errorHandlerMiddleware from './middlewares/errorHandler';

config();

const app = express();

// const DATABASE_URL = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`;

const DATABASE_URL = process.env.DATABASE_URL;

// app.use(cors());
app.use(morgan('common'));
app.use(bodyParser.json());

// custom routes
app.use(routes);

app.use(errorHandlerMiddleware);

const main = () => {
  doRetryConnectDB(() => {
    const PORT = process.env.PORT || DEFAULT_PORT;

    // const httpsServer = https.createServer(
    //   {
    //     key: fs.readFileSync(path.join(__dirname, 'example.key')),
    //     cert: fs.readFileSync(path.join(__dirname, 'example.crt')),
    //   },
    //   app,
    // );

    // httpsServer.listen(PORT, async () => {
    //   console.log(`Server is listening at port ${PORT}`);
    // });
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
