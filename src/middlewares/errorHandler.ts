import { Request, Response, NextFunction } from 'express';

export class ErrorHandler extends Error {
  statusCode: number;

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
  const { statusCode, message } = err;
  return res.status(statusCode).json({
    message,
    statusCode,
    status: 'error',
  });
};
