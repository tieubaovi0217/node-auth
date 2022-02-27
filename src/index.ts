import * as express from 'express';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as cors from 'cors';
// Routes
import auth from './routes';

const app = express();

const PORT = process.env.PORT || 5000;
const DATABASE_URL = 'mongodb://localhost/auth';

app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use('/auth', auth);

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
