// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as cors from 'cors';
import * as multer from 'multer';

// Routes
import routes from './routes';
import isAuth from './middlewares/isAuth';
import attachUser from './middlewares/attachUser';

config();

const app = express();

const PORT = process.env.PORT || 5000;
const DATABASE_URL = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // store files to corresponding directory for each user
    // create a directory if user has registered successfully
    const { path: subPath } = JSON.parse(JSON.stringify(req.body));

    const userDir = path.join(
      process.env.WEB_SERVER_RESOURCE_PATH,
      req.user.username,
      subPath,
    );

    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    // TODO: handle upload same file name
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

app.get('/is_auth', isAuth, async (req, res) => {
  res.status(200).send();
});

// custom routes
app.use(routes);
app.use(
  '/upload',
  isAuth,
  attachUser,
  upload.single('file'),
  async (req, res) => {
    console.log(req.file);
    res.send('Files uploaded successfully');
  },
);

const main = () => {
  app.listen(PORT, async () => {
    console.log(
      `The Authentication Server is listening at http://localhost:${PORT}`,
    );
    console.log('Connected to the database');
  });
};

const doRetryConnectDB = async () => {
  return mongoose.connect(DATABASE_URL, function (err) {
    if (err) {
      console.error(
        'Failed to connect to mongo on startup - retrying in 3 sec',
        err,
      );
      setTimeout(doRetryConnectDB, 3000);
    } else {
      main();
    }
  });
};

doRetryConnectDB();
// app.listen(PORT, async () => {
//   console.log(
//     `The Authentication Server is listening at http://localhost:${PORT}`,
//   );
//   console.log('Connected to the database');
// });
