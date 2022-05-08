import * as jwt from 'jsonwebtoken';
import isAuth from '../src/middlewares/isAuth';

afterEach(() => {
  jest.restoreAllMocks();
});

let email: string;
let req: any;
let res: any;
let next: any;

const setUpTest = () => {
  email = 'test@gmail.com';
  req = {
    headers: {},
  };
  res = {};
  next = jest.fn();
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('given jwt token', () => {
  const decoded = 'decoded';
  beforeEach(() => {
    setUpTest();
    jest.spyOn(jwt, 'verify').mockImplementation(() => decoded);
    req.headers.authorization = 'Bearer jwttoken';
  });

  it('should attach decoded token into token', () => {
    isAuth(req, res, next);

    expect(req.token).toBe(decoded);
  });

  it('should invoke next with no params', () => {
    isAuth(req, res, next);

    expect(next).toBeCalledWith();
  });
});

describe('given malformed jwt', () => {
  beforeEach(() => {
    setUpTest();
    req.headers.authorization = 'Bearer malformed';
  });

  it('should throw err if given malformed jwt', () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('malformed jwt');
    });

    isAuth(req, res, next);

    expect(next).toBeCalledWith(new Error('malformed jwt'));
  });
});

describe('not given jwt token', () => {
  beforeEach(() => {
    setUpTest();
    req.headers.authorization = undefined;
  });

  it('should throw err no authorization token was found', () => {
    isAuth(req, res, next);

    expect(next).toBeCalledWith(new Error('No authorization token was found'));
  });
});
