import { config } from 'dotenv';

import * as jwt from 'jsonwebtoken';

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
      return next();
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  res.status(401).json({ error: 'No authorization token was found' });
};
