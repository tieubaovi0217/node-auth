import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export class ErrorHandler extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, message: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

export const catchValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    throw new ErrorHandler(400, errors.array()[0].msg);
  }
  next();
};

export default (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err.code && err.code === 'ENOENT') {
    err.message = 'No such file or directory';
  }

  console.log(err);
  return res.status(err.statusCode || 400).json({ error: err.message });
};
