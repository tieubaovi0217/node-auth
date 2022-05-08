import { Request, Response, NextFunction } from 'express';

export class ErrorHandler extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, message: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

export default (
  err: ErrorHandler,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (err.code && err.code === 'ENOENT') {
    err.message = 'No such file or directory';
  }

  console.log(err);
  return res.status(err.statusCode || 400).json({ error: err.message });
};
