export class ErrorHandler extends Error {
  statusCode: number;

  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

export const handleError = (err: ErrorHandler, res) => {
  const { statusCode, message } = err;
  return res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};
