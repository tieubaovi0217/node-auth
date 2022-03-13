// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { config } from 'dotenv';
import * as path from 'path';
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
const DATABASE_URL = 'mongodb://localhost/auth';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // store files to corresponding directory for each user
    cb(
      null,
      path.join(process.env.WEB_SERVER_RESOURCE_PATH, req.user.username),
    );
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// custom routes
app.use(routes);
app.use(
  '/upload',
  isAuth,
  attachUser,
  upload.single('file'),
  async (req, res) => {
    console.log(req.file);
    res.send('upload');
  },
);

app.listen(PORT, async () => {
  try {
    await mongoose.connect(DATABASE_URL);

    console.log(
      `The Authentication Server is listening at http://localhost:${PORT}`,
    );
    console.log('Connected to the database');
  } catch (err) {
    console.log(err);
  }
});
