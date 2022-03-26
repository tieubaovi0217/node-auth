import { config } from 'dotenv';

import * as jwt from 'jsonwebtoken';
import { ErrorHandler } from '../error';

config();

export default (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.token = decoded;
      next();
    } catch (err) {
      next(err);
    }
  }

  next(new ErrorHandler(403, 'No authorization token was found'));
};
