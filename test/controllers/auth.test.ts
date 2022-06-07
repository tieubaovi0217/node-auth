import * as fs from 'fs';
import AuthService from '../../src/services/auth';
import auth from '../../src/controllers/auth';
import { validationResult } from 'express-validator';
import { makeResourcePath } from '../../src/shares/makeResourcePath';

jest.mock('../../src/services/auth');
jest.mock('express-validator');
jest.mock('../../src/shares/makeResourcePath');

let req: any;
let res: any;
let next: any;

(AuthService.getInstance as jest.MockedFunction<any>) = jest.fn(() => {
  return {
    login(username: string, password: string) {
      if (username === 'admin' && password === 'admin') {
        return Promise.resolve({ user: 'admin', token: 'token' });
      }
      throw new Error('not found');
    },
    signUp(userData: any) {
      if (userData.username !== 'admin') {
        return Promise.resolve({ user: userData.username, token: 'token' });
      }
      return Promise.reject(new Error('exists'));
    },
  };
});

(validationResult as jest.MockedFunction<any>).mockImplementation(
  (req: any) => {
    if (
      typeof req.body.username === 'string' &&
      req.body.username.length >= 4
    ) {
      return {
        isEmpty() {
          return true;
        },
      };
    }
    return {
      isEmpty() {
        return false;
      },
      array() {
        return [{ msg: 'username must contain at least 4 characters' }];
      },
    };
  },
);

beforeEach(() => {
  req = {
    body: {},
  };

  res = {
    json: jest.fn(),
  };

  next = jest.fn();
});

describe('login', () => {
  it('should login successfully', async () => {
    req.body = { username: 'admin', password: 'admin' };

    await auth.login(req, res, next);

    expect(res.json).toBeCalledWith({ user: 'admin', token: 'token' });
  });

  it('should login fail if given a valid username that not exist', async () => {
    req.body = { username: 'test', password: 'test' };

    await auth.login(req, res, next);

    expect(next).toBeCalledWith(new Error('not found'));
  });
});

describe('signup', () => {
  it('should signup successfully', async () => {
    req.body = { username: 'test', password: 'test', email: 'test@gmail.com' };

    const mkdirMock = jest.spyOn(fs.promises, 'mkdir');
    (mkdirMock as jest.MockedFunction<any>).mockResolvedValue(true);
    (makeResourcePath as jest.MockedFunction<any>).mockImplementation(
      () => 'abcd',
    );

    await auth.signup(req, res, next);

    expect(res.json).toBeCalledWith({ user: 'test', token: 'token' });
  });

  it('should signup fail if given an existing username', async () => {
    req.body = { username: 'admin', password: 'test', email: 'test@gmail.com' };

    await auth.signup(req, res, next);

    expect(next).toBeCalledWith(new Error('exists'));
  });

  it('should signup fail if given a username that has less than 4 characters', async () => {
    req.body = { username: 'tes', password: 'test', email: 'test@gmail.com' };

    await auth.signup(req, res, next);

    expect(next).toBeCalledWith(
      new Error('username must contain at least 4 characters'),
    );
  });
});
