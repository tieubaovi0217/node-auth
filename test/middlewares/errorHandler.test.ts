import errorHandler, { ErrorHandler } from '../../src/middlewares/errorHandler';

describe('errorHandler middleware', () => {
  let err: any;
  let req: any;
  let res: any;
  let next: any;

  it('should return no such file or directory error', () => {
    err = {
      code: 'ENOENT',
    };

    const jsonMock = jest.fn();
    const statusMock = jest.fn(() => {
      return {
        json: jsonMock,
      };
    });
    res = {
      status: statusMock,
    };

    errorHandler(err, req, res, next);

    expect(statusMock).toBeCalledWith(400);
    expect(jsonMock).toBeCalledWith({ error: 'No such file or directory' });
  });
});
